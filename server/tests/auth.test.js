import test, { describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

describe('Auth API Tests (/api/v1/auth)', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ['teststudent@campus.edu', 'testexploit@campus.edu'] } });
    await mongoose.connection.close();
  });

  test('POST /register should reject invalid inputs with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'bad-email', password: '123' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /register should successfully create a student and set cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Student',
        email: 'teststudent@campus.edu',
        password: 'ValidPassword123!',
        studentId: 'ST-9999',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, 'teststudent@campus.edu');
    assert.strictEqual(res.body.user.role, 'student');
    assert.ok(res.body.token);
    assert.ok(res.headers['set-cookie']);
  });

  test('POST /register must not allow caller to set role to admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Hacker Attempt',
        email: 'testexploit@campus.edu',
        password: 'ValidPassword123!',
        role: 'admin',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.role, 'student'); // role remains student!
  });

  test('POST /login should reject wrong credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'teststudent@campus.edu',
        password: 'WrongPassword123!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /login with correct password returns token and user data', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'teststudent@campus.edu',
        password: 'ValidPassword123!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, 'teststudent@campus.edu');
    assert.strictEqual(res.body.user.password, undefined); // password is not exposed
  });

  test('GET /me requires authentication', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    assert.strictEqual(res.status, 401);
  });

  test('GET /me succeeds with valid Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'teststudent@campus.edu',
        password: 'ValidPassword123!',
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.user.email, 'teststudent@campus.edu');
  });
});
