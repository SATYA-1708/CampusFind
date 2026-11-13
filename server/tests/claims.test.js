import test, { describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';
import Claim from '../src/models/Claim.js';

describe('Claims API Tests (/api/v1/claims)', () => {
  let reporterUser, reporterToken;
  let claimantUser, claimantToken;
  let strangerUser, strangerToken;
  let foundItem;
  let testClaimId;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();

    reporterUser = await User.create({
      name: 'Item Finder User',
      email: 'finder_claim@campus.edu',
      password: 'Password123!',
      role: 'student',
    });

    claimantUser = await User.create({
      name: 'Real Owner Claimant',
      email: 'claimant@campus.edu',
      password: 'Password123!',
      role: 'student',
    });

    strangerUser = await User.create({
      name: 'Unrelated Student',
      email: 'stranger@campus.edu',
      password: 'Password123!',
      role: 'student',
    });

    const l1 = await request(app).post('/api/v1/auth/login').send({
      email: 'finder_claim@campus.edu',
      password: 'Password123!',
    });
    reporterToken = l1.body.token;

    const l2 = await request(app).post('/api/v1/auth/login').send({
      email: 'claimant@campus.edu',
      password: 'Password123!',
    });
    claimantToken = l2.body.token;

    const l3 = await request(app).post('/api/v1/auth/login').send({
      email: 'stranger@campus.edu',
      password: 'Password123!',
    });
    strangerToken = l3.body.token;

    foundItem = await Item.create({
      owner: reporterUser._id,
      type: 'found',
      title: 'Found Car Keys With Keychain',
      description: 'Found Toyota key fob with miniature teddy bear keychain in parking lot B.',
      category: 'Keys',
      campusLocation: 'North Campus Quad',
      eventDate: new Date(),
      status: 'open',
    });
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ['finder_claim@campus.edu', 'claimant@campus.edu', 'stranger@campus.edu'] } });
    if (foundItem) await Item.findByIdAndDelete(foundItem._id);
    if (testClaimId) await Claim.findByIdAndDelete(testClaimId);
    await mongoose.connection.close();
  });

  test('POST /item/:itemId rejects owner claiming their own item', async () => {
    const res = await request(app)
      .post(`/api/v1/claims/item/${foundItem._id}`)
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({
        explanation: 'This is my own item and I want to claim it myself!',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /item/:itemId allows another student to submit claim with explanation', async () => {
    const res = await request(app)
      .post(`/api/v1/claims/item/${foundItem._id}`)
      .set('Authorization', `Bearer ${claimantToken}`)
      .send({
        explanation: 'These are my car keys. The teddy bear keychain has a brown vest with the name "Barnaby" stitched on it, and the fob has a cracked unlock button.',
        contactNote: 'Can meet at the Campus Library lobby anytime after 1pm.',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'pending');
    testClaimId = res.body.data._id;
  });

  test('GET /item/:itemId forbids unrelated third-party students from reading private claims', async () => {
    const res = await request(app)
      .get(`/api/v1/claims/item/${foundItem._id}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    assert.strictEqual(res.status, 403);
  });

  test('GET /item/:itemId allows listing owner to review claims privately', async () => {
    const res = await request(app)
      .get(`/api/v1/claims/item/${foundItem._id}`)
      .set('Authorization', `Bearer ${reporterToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.data[0].explanation.includes('Barnaby'));
  });

  test('PATCH /:claimId/decision allows owner to accept claim and mark resolved', async () => {
    const res = await request(app)
      .patch(`/api/v1/claims/${testClaimId}/decision`)
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({
        status: 'accepted',
        ownerDecisionReason: 'Description matches exactly. Met up and returned to owner.',
        markResolved: true,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'accepted');

    const updatedItem = await Item.findById(foundItem._id);
    assert.strictEqual(updatedItem.status, 'resolved');
  });
});
