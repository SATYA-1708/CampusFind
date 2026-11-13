import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  extractKeywords,
  calculateMatchScore,
  rankMatches,
} from '../src/services/matchService.js';

describe('Deterministic Match Suggestion Logic Tests', () => {
  test('extractKeywords should tokenize, lowercase and filter stopwords', () => {
    const text = 'Lost my white Apple AirPods with green silicone case at the library';
    const keywords = extractKeywords(text);

    assert.ok(keywords.has('apple'));
    assert.ok(keywords.has('airpods'));
    assert.ok(keywords.has('green'));
    assert.ok(keywords.has('silicone'));
    assert.ok(keywords.has('library'));
    assert.strictEqual(keywords.has('the'), false);
    assert.strictEqual(keywords.has('at'), false);
    assert.strictEqual(keywords.has('my'), false);
  });

  test('calculateMatchScore returns 0 for identical item types (lost vs lost)', () => {
    const itemA = { type: 'lost', category: 'Electronics' };
    const itemB = { type: 'lost', category: 'Electronics' };
    const result = calculateMatchScore(itemA, itemB);
    assert.strictEqual(result.score, 0);
  });

  test('calculateMatchScore accumulates points for category, location, date, and keywords', () => {
    const now = new Date();
    const lostItem = {
      type: 'lost',
      category: 'Electronics',
      campusLocation: 'Main Library',
      eventDate: now,
      title: 'Apple AirPods Pro in Green Case',
      description: 'Lost wireless earphones near the silent study area',
    };

    const foundItem = {
      type: 'found',
      category: 'Electronics',
      campusLocation: 'Main Library',
      eventDate: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
      title: 'Found Apple AirPods with Green Case',
      description: 'Found wireless earphones left on study table',
    };

    const { score, reasons } = calculateMatchScore(lostItem, foundItem);

    // Category: +35
    // Location: +25
    // Date: +20
    // Keywords (apple, airpods, green, case, wireless, earphones): +20
    // Total should be 100
    assert.strictEqual(score, 100);
    assert.ok(reasons.some((r) => r.includes('Same category: Electronics')));
    assert.ok(reasons.some((r) => r.includes('Exact location match: Main Library')));
    assert.ok(reasons.some((r) => r.includes('Dates within 24 hours')));
  });

  test('rankMatches filters out low scores (<25) and items with same owner', () => {
    const target = {
      _id: '507f1f77bcf86cd799439011',
      owner: 'user1',
      type: 'lost',
      category: 'Books & Stationery',
      campusLocation: 'Student Center',
      eventDate: new Date(),
      title: 'Chemistry 101 Notebook',
      description: 'Blue spiral notebook',
    };

    const candidates = [
      // Same owner -> should be ignored
      {
        _id: '507f1f77bcf86cd799439012',
        owner: 'user1',
        type: 'found',
        category: 'Books & Stationery',
        campusLocation: 'Student Center',
        eventDate: new Date(),
        title: 'Chemistry Notebook',
        description: 'Blue notebook',
      },
      // Completely unrelated item -> should score < 25
      {
        _id: '507f1f77bcf86cd799439013',
        owner: 'user2',
        type: 'found',
        category: 'Jewelry & Watches',
        campusLocation: 'Athletics & Gymnasium',
        eventDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        title: 'Silver ring',
        description: 'Found in gym locker',
      },
      // Good candidate
      {
        _id: '507f1f77bcf86cd799439014',
        owner: 'user3',
        type: 'found',
        category: 'Books & Stationery',
        campusLocation: 'Student Center',
        eventDate: new Date(),
        title: 'Found Blue Chemistry Spiral Notebook',
        description: 'Left on couch in student lounge',
      },
    ];

    const ranked = rankMatches(target, candidates, 25);
    assert.strictEqual(ranked.length, 1);
    assert.strictEqual(ranked[0].item._id, '507f1f77bcf86cd799439014');
    assert.ok(ranked[0].score >= 80);
  });
});
