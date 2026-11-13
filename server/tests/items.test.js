import test, { describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';

describe('Items API Tests (/api/v1/items)', () => {
  let userToken1;
  let user1;
  let userToken2;
  let user2;
  let createdItemId;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();

    user1 = await User.create({
      name: 'Item Owner One',
      email: 'owner1@campus.edu',
      password: 'Password123!',
      role: 'student',
    });

    user2 = await User.create({
      name: 'Item User Two',
      email: 'user2@campus.edu',
      password: 'Password123!',
      role: 'student',
    });

    const login1 = await request(app).post('/api/v1/auth/login').send({
      email: 'owner1@campus.edu',
      password: 'Password123!',
    });
    userToken1 = login1.body.token;

    const login2 = await request(app).post('/api/v1/auth/login').send({
      email: 'user2@campus.edu',
      password: 'Password123!',
    });
    userToken2 = login2.body.token;
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ['owner1@campus.edu', 'user2@campus.edu'] } });
    if (createdItemId) {
      await Item.findByIdAndDelete(createdItemId);
    }
    await mongoose.connection.close();
  });

  test('GET / returns public items with pagination', async () => {
    const res = await request(app).get('/api/v1/items');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
  });

  test('POST / requires authentication', async () => {
    const res = await request(app).post('/api/v1/items').send({
      type: 'lost',
      title: 'Missing Calculator',
      description: 'TI-84 Plus CE graphing calculator in blue',
      category: 'Electronics',
      campusLocation: 'Main Library',
      eventDate: new Date(),
    });
    assert.strictEqual(res.status, 401);
  });

  test('POST / creates a new item with valid authenticated student', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        type: 'lost',
        title: 'Missing TI-84 Plus CE Calculator',
        description: 'TI-84 Plus CE graphing calculator in electric blue with engraved name.',
        category: 'Electronics',
        campusLocation: 'Science & Engineering Complex',
        locationDetails: 'Room 302 desk',
        eventDate: new Date(),
        identifyingDetails: 'Serial number sticker on back has partial tear',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Missing TI-84 Plus CE Calculator');
    assert.strictEqual(res.body.data.status, 'open');
    createdItemId = res.body.data._id;
  });

  test('PUT /:id forbids non-owners from editing', async () => {
    const res = await request(app)
      .put(`/api/v1/items/${createdItemId}`)
      .set('Authorization', `Bearer ${userToken2}`)
      .send({
        title: 'Hacked Title By Other User',
      });

    assert.strictEqual(res.status, 403);
  });

  test('PUT /:id allows owner to update listing details', async () => {
    const res = await request(app)
      .put(`/api/v1/items/${createdItemId}`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        title: 'Updated Calculator Title (Still Missing)',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.title, 'Updated Calculator Title (Still Missing)');
  });

  test('PATCH /:id/close allows owner to close listing', async () => {
    const res = await request(app)
      .patch(`/api/v1/items/${createdItemId}/close`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        status: 'closed',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'closed');
  });
});
