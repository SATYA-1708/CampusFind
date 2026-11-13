import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Report from '../models/Report.js';

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections for fresh seed...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      Report.deleteMany({}),
    ]);

    // 1. Create Demo Admin (only if SEED_ADMIN_EMAIL or default is set)
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@campus.edu';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass2026!';
    const adminName = process.env.SEED_ADMIN_NAME || 'Campus Moderator Admin';

    console.log(`[Seed] Creating demo admin account (${adminEmail})...`);
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      studentId: 'STAFF-9001',
      phone: '+1 (555) 019-2831',
    });

    // 2. Create Student Accounts
    console.log('[Seed] Creating demo student accounts...');
    const student1 = await User.create({
      name: 'Maya Patel',
      email: 'maya.patel@campus.edu',
      password: 'StudentPass123!',
      role: 'student',
      studentId: 'CS-2024-819',
      phone: '+1 (555) 012-3456',
    });

    const student2 = await User.create({
      name: 'Marcus Chen',
      email: 'marcus.chen@campus.edu',
      password: 'StudentPass123!',
      role: 'student',
      studentId: 'EE-2023-402',
      phone: '+1 (555) 018-7654',
    });

    const student3 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@campus.edu',
      password: 'StudentPass123!',
      role: 'student',
      studentId: 'BIO-2025-117',
      phone: '+1 (555) 017-9922',
    });

    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // 3. Create Items (with natural matching pairs for testing deterministic match engine)
    console.log('[Seed] Creating demo lost and found items...');

    // Pair 1: High Match (Electronics - Apple AirPods Pro)
    // Maya lost AirPods in Main Library 2 days ago
    const lostAirPods = await Item.create({
      owner: student1._id,
      type: 'lost',
      title: 'White Apple AirPods Pro 2nd Gen with Matte Case',
      description: 'Lost my AirPods Pro with a matte dark green silicone protective case and a small silver carabiner clip. Last had them on the 2nd floor silent study area near the west window.',
      category: 'Electronics',
      campusLocation: 'Main Library',
      locationDetails: '2nd Floor quiet study cubicle #24',
      eventDate: daysAgo(2),
      identifyingDetails: 'Left earbud has a tiny scrape near the stem sensor. Case has small engraved initials "MP".',
      status: 'open',
    });

    // Marcus found AirPods in Main Library 1 day ago
    const foundAirPods = await Item.create({
      owner: student2._id,
      type: 'found',
      title: 'Found Apple AirPods in Green Silicone Case',
      description: 'Found a pair of Apple wireless earbuds in a dark green silicone cover with a silver clip left on a study desk on the 2nd floor of the library.',
      category: 'Electronics',
      campusLocation: 'Main Library',
      locationDetails: 'Turned in to library front desk supervisor after waiting 30 mins',
      eventDate: daysAgo(1),
      identifyingDetails: 'Case has custom engraved initials on back. Claimant must state what initials are engraved.',
      status: 'open',
    });

    // Pair 2: Water Bottle (Nearby campus location - Dining Commons & Student Center)
    const lostBottle = await Item.create({
      owner: student3._id,
      type: 'lost',
      title: 'Hydro Flask 32oz Wide Mouth in Cobalt Blue',
      description: 'Navy/cobalt blue insulated metal water flask covered with computer science and national park stickers.',
      category: 'Water Bottles & Tumblers',
      campusLocation: 'Dining Commons',
      locationDetails: 'Left near booth #12 during lunchtime',
      eventDate: daysAgo(3),
      identifyingDetails: 'Stickers include GitHub Octocat, Yellowstone NP, and a dent on the bottom rim.',
      status: 'open',
    });

    const foundBottle = await Item.create({
      owner: student1._id,
      type: 'found',
      title: 'Blue Metal Hydro Flask with Stickers',
      description: 'Found blue metal water flask left behind in dining hall seating area near lunch trays.',
      category: 'Water Bottles & Tumblers',
      campusLocation: 'Dining Commons',
      locationDetails: 'Placed in dining hall lost-and-found bin',
      eventDate: daysAgo(3),
      identifyingDetails: 'Claimant should name 2 stickers on the bottle.',
      status: 'open',
    });

    // Item 3: Backpack (Found) with a pending claim from Maya
    const foundBackpack = await Item.create({
      owner: student2._id,
      type: 'found',
      title: 'Black North Face Surge Backpack',
      description: 'Black backpack with multiple compartments found under lecture seat in auditorium row G.',
      category: 'Bags & Backpacks',
      campusLocation: 'Auditorium',
      locationDetails: 'Main Lecture Hall 101, Row G seat 14',
      eventDate: daysAgo(4),
      identifyingDetails: 'Contains notebooks and calculus textbook.',
      status: 'pending_claim',
    });

    // Create a demo claim for testing listing owner features
    console.log('[Seed] Creating demo claim...');
    const demoClaim = await Claim.create({
      item: foundBackpack._id,
      claimant: student1._id,
      explanation: 'This is my backpack! Inside the front zipper pocket is a student ID badge for Maya Patel and a spiral notebook with Math 201 notes and homework #3.',
      contactNote: 'Available between 2pm and 5pm at the Student Center Starbucks.',
      status: 'pending',
    });

    // Item 4: Student ID Card (Lost)
    const lostId = await Item.create({
      owner: student2._id,
      type: 'lost',
      title: 'University Student ID Card - Marcus Chen',
      description: 'Lost campus ID card with blue lanyard and red dorm room key tag.',
      category: 'ID & Cards',
      campusLocation: 'Science & Engineering Complex',
      locationDetails: 'Probably dropped while walking from lab 204 to courtyard',
      eventDate: daysAgo(1),
      identifyingDetails: 'Student ID # ending in 402 with CS club sticker on lanyard.',
      status: 'open',
    });

    // Item 5: Keys (Found)
    const foundKeys = await Item.create({
      owner: student3._id,
      type: 'found',
      title: 'Keychain with 3 Keys and Mini Flashlight',
      description: 'Found bunch of keys on black cord lanyard outside gym entrance.',
      category: 'Keys',
      campusLocation: 'Athletics & Gymnasium',
      locationDetails: 'Bench near locker room entrance',
      eventDate: daysAgo(5),
      identifyingDetails: 'Includes a Honda car key fob and small silver LED torch.',
      status: 'open',
    });

    // Item 6: Resolved Item (Calculus Textbook)
    const resolvedItem = await Item.create({
      owner: student1._id,
      type: 'found',
      title: 'Stewart Calculus Early Transcendentals 9th Edition',
      description: 'Hardcover textbook found on bench in North Campus Quad.',
      category: 'Books & Stationery',
      campusLocation: 'North Campus Quad',
      locationDetails: 'Stone bench near fountain',
      eventDate: daysAgo(8),
      identifyingDetails: 'Name on inside flyleaf.',
      status: 'resolved',
      resolvedAt: daysAgo(6),
    });

    // Item 7: Moderated/Hidden Item (for testing admin moderation)
    const inappropriateItem = await Item.create({
      owner: student2._id,
      type: 'found',
      title: 'Spam listing for testing moderation',
      description: 'This is an inappropriate or spam test listing flagged by students for administrator review.',
      category: 'Other',
      campusLocation: 'Student Center',
      eventDate: daysAgo(2),
      status: 'open',
      isModeratedHidden: true,
      moderationReason: 'Reported for spam content and commercial advertisement violation.',
    });

    // Create a demo content report on the inappropriate item
    console.log('[Seed] Creating demo moderation report...');
    await Report.create({
      reporter: student3._id,
      item: inappropriateItem._id,
      reason: 'spam_or_fake',
      details: 'This user appears to be advertising commercial services rather than a legitimate lost or found item.',
      status: 'action_taken',
      adminNotes: 'Listing verified as spam and hidden from public feed.',
      reviewedBy: admin._id,
      reviewedAt: daysAgo(1),
    });

    // Also create a pending report on lostBottle for testing admin moderation workflows
    await Report.create({
      reporter: student2._id,
      item: lostBottle._id,
      reason: 'duplicate_listing',
      details: 'Possible duplicate of an earlier bottle post.',
      status: 'pending',
    });

    console.log('==================================================');
    console.log(' SEED COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Accounts Created:');
    console.log(`  Admin:    ${adminEmail}  |  Password: ${adminPassword}`);
    console.log(`  Student1: ${student1.email}  |  Password: StudentPass123!`);
    console.log(`  Student2: ${student2.email} |  Password: StudentPass123!`);
    console.log(`  Student3: ${student3.email} |  Password: StudentPass123!`);
    console.log('==================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
