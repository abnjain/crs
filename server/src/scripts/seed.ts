/**
 * ============================================================
 * Seed Script - Production Dummy Data Seeder
 * Usage: npm run seed
 * ============================================================
 *
 * Creates dummy data for all Mongoose models used by the API:
 *   - User: 1 Super Admin, 1 Admin, 1 HOD, 5 Faculty, 10 Alumni
 *   - Alumni: profile row per seeded alumni user (`alumni*N@crs.local`)
 *   - Event: sample events (organizer = HOD if present)
 *   - SiteConfig: singleton defaults (skipped if exists)
 *   - AuditLog: sample rows if collection empty
 *
 * MongoDB note: Prisma Migrate does not apply to MongoDB, and Prisma Client
 * writes typically require a replica set. This project uses Mongoose for all
 * persisted data; keep this script as the single source of truth for dev seeding.
 *
 * Idempotent: skips existing users (by email), alumni (by user ref), events (by title + date).
 * Default password for all dummy users: Crs@123456
 */

import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User, type UserRole } from '../models/User.js';
import { Alumni } from '../models/Alumni.js';
import { Event } from '../models/Event.js';
import { SiteConfig } from '../models/SiteConfig.js';
import { AuditLog } from '../models/AuditLog.js';

const DUMMY_PASSWORD = 'Crs@123456';

interface SeedUser {
  name: string;
  email: string;
  role: UserRole;
}

const seedUsers: SeedUser[] = [
  // ── Super Admin ──────────────────────────────────────────
  {
    name: 'Rajesh Kumar',
    email: 'superadmin@crs.local',
    role: 'superadmin',
  },

  // ── Admin ────────────────────────────────────────────────
  {
    name: 'Priya Sharma',
    email: 'admin@crs.local',
    role: 'admin',
  },

  // ── HOD ───────────────────────────────────────────────────
  {
    name: 'Dr. Anil Verma',
    email: 'hod@crs.local',
    role: 'hod',
  },

  // ── Faculty (5) ───────────────────────────────────────────
  {
    name: 'Dr. Sneha Patel',
    email: 'faculty1@crs.local',
    role: 'faculty',
  },
  {
    name: 'Prof. Amit Gupta',
    email: 'faculty2@crs.local',
    role: 'faculty',
  },
  {
    name: 'Dr. Meera Reddy',
    email: 'faculty3@crs.local',
    role: 'faculty',
  },
  {
    name: 'Prof. Vikram Singh',
    email: 'faculty4@crs.local',
    role: 'faculty',
  },
  {
    name: 'Dr. Kavita Nair',
    email: 'faculty5@crs.local',
    role: 'faculty',
  },

  // ── Alumni (10) ───────────────────────────────────────────
  {
    name: 'Arjun Mehta',
    email: 'alumni1@crs.local',
    role: 'alumni',
  },
  {
    name: 'Sneha Iyer',
    email: 'alumni2@crs.local',
    role: 'alumni',
  },
  {
    name: 'Rohan Kapoor',
    email: 'alumni3@crs.local',
    role: 'alumni',
  },
  {
    name: 'Ananya Das',
    email: 'alumni4@crs.local',
    role: 'alumni',
  },
  {
    name: 'Karan Shah',
    email: 'alumni5@crs.local',
    role: 'alumni',
  },
  {
    name: 'Divya Krishnan',
    email: 'alumni6@crs.local',
    role: 'alumni',
  },
  {
    name: 'Vivek Chatterjee',
    email: 'alumni7@crs.local',
    role: 'alumni',
  },
  {
    name: 'Ishaan Bhat',
    email: 'alumni8@crs.local',
    role: 'alumni',
  },
  {
    name: 'Riya Joshi',
    email: 'alumni9@crs.local',
    role: 'alumni',
  },
  {
    name: 'Aditya Rajput',
    email: 'alumni10@crs.local',
    role: 'alumni',
  },
];

const alumniProfileByEmailSuffix: Record<
  number,
  {
    graduationYear: number;
    batch: string;
    department: string;
    company: string;
    designation: string;
    location: string;
    linkedIn?: string;
    phone?: string;
    bio: string;
    isVerified: boolean;
  }
> = {
  1: { graduationYear: 2019, batch: 'CS-2019-A', department: 'Computer Science', company: 'TCS Digital', designation: 'Senior Engineer', location: 'Bengaluru', linkedIn: 'https://linkedin.com/in/example-mehta', phone: '+91 9876543210', bio: 'Full-stack engineer; CRS portal contributor.', isVerified: true },
  2: { graduationYear: 2020, batch: 'CS-2020-B', department: 'Information Technology', company: 'Infosys', designation: 'Technology Analyst', location: 'Pune', phone: '+91 9876543211', bio: 'Interested in HCI and instructional design.', isVerified: true },
  3: { graduationYear: 2018, batch: 'CS-2018-A', department: 'Computer Science', company: 'Microsoft India', designation: 'Software Engineer II', location: 'Hyderabad', linkedIn: 'https://linkedin.com/in/example-kapoor', bio: 'Cloud and backend systems.', isVerified: false },
  4: { graduationYear: 2021, batch: 'IT-2021-A', department: 'Information Technology', company: 'Wipro', designation: 'Consultant', location: 'Bhopal', phone: '+91 9876543212', bio: 'Data pipelines and ERP integrations.', isVerified: true },
  5: { graduationYear: 2017, batch: 'CS-2017-B', department: 'Computer Science', company: 'Zoho', designation: 'Product Engineer', location: 'Chennai', bio: 'SaaS and developer tooling.', isVerified: false },
  6: { graduationYear: 2022, batch: 'CS-2022-A', department: 'Computer Science', company: 'PhonePe', designation: 'Associate Engineer', location: 'Bengaluru', phone: '+91 9876543213', bio: 'Payments and JVM services.', isVerified: true },
  7: { graduationYear: 2016, batch: 'IT-2016-A', department: 'Information Technology', company: 'Cognizant', designation: 'Delivery Lead', location: 'Kolkata', linkedIn: 'https://linkedin.com/in/example-chatterjee', bio: 'Enterprise delivery & mentoring.', isVerified: true },
  8: { graduationYear: 2023, batch: 'CS-2023-B', department: 'Computer Science', company: 'Razorpay', designation: 'Intern → SDE-I', location: 'Bengaluru', bio: 'Fintech onboarding flows.', isVerified: false },
  9: { graduationYear: 2019, batch: 'IT-2019-B', department: 'Information Technology', company: 'Deloitte', designation: 'Analyst', location: 'Gurgaon', phone: '+91 9876543214', bio: 'Cyber and risk advisory.', isVerified: true },
  10: { graduationYear: 2024, batch: 'CS-2024-A', department: 'Computer Science', company: 'ISRO outreach', designation: 'Project trainee', location: 'Indore', bio: 'Remote sensing datasets.', isVerified: false },
};

const seedEvents = [
  {
    title: 'Annual Tech Symposium 2026',
    description:
      'Keynotes on AI in education, cybersecurity, and industry panels with SCSIT alumni.',
    type: 'conference' as const,
    date: new Date('2026-03-15T09:30:00.000Z'),
    endDate: new Date('2026-03-15T17:00:00.000Z'),
    location: 'SCSIT Seminar Hall',
    isOnline: false,
    meetLink: '',
    status: 'upcoming' as const,
    maxAttendees: 200,
    tags: ['scsit', 'symposium', 'tech'],
  },
  {
    title: 'Hands-on MongoDB & Express Workshop',
    description: 'Full-day lab: schema design with Mongoose, REST APIs with Express v5.',
    type: 'workshop' as const,
    date: new Date('2026-04-22T04:30:00.000Z'),
    endDate: new Date('2026-04-22T12:30:00.000Z'),
    location: 'Lab Block — Room 402',
    isOnline: false,
    meetLink: '',
    status: 'upcoming' as const,
    maxAttendees: 45,
    tags: ['mongodb', 'backend', 'scsit'],
  },
  {
    title: 'Alumni Connect — Virtual Fireside Chat',
    description: 'Monthly webinar with placements and startup founders from the SCSIT network.',
    type: 'webinar' as const,
    date: new Date('2026-05-08T13:30:00.000Z'),
    endDate: new Date('2026-05-08T15:00:00.000Z'),
    location: '',
    isOnline: true,
    meetLink: 'https://meet.example.edu/crs-alumni-chat',
    status: 'upcoming' as const,
    maxAttendees: 500,
    tags: ['alumni', 'webinar', 'placement'],
  },
  {
    title: 'Class of 2020 Five-Year Reunion',
    description: 'Campus meetup, dept tour, and evening cultural program.',
    type: 'reunion' as const,
    date: new Date('2026-06-02T06:30:00.000Z'),
    endDate: new Date('2026-06-02T13:30:00.000Z'),
    location: 'SCSIT Quadrangle',
    isOnline: false,
    meetLink: '',
    status: 'upcoming' as const,
    maxAttendees: 150,
    tags: ['reunion', 'batch-2020'],
  },
  {
    title: 'Seminar: HCI for Rural India',
    description: 'Open faculty-led seminar series; RSVP required.',
    type: 'seminar' as const,
    date: new Date('2025-11-12T06:30:00.000Z'),
    endDate: new Date('2025-11-12T09:30:00.000Z'),
    location: 'SCSIT Room 305',
    isOnline: false,
    meetLink: '',
    status: 'completed' as const,
    maxAttendees: 80,
    tags: ['seminar', 'hci'],
  },
];

async function seedAlumniAndEvents(): Promise<{
  alumniCreated: number;
  alumniSkipped: number;
  eventsCreated: number;
  eventsSkipped: number;
  modelErrors: number;
}> {
  const out = { alumniCreated: 0, alumniSkipped: 0, eventsCreated: 0, eventsSkipped: 0, modelErrors: 0 };

  const organizer =
    (await User.findOne({ role: 'hod' }).exec()) ??
    (await User.findOne({ role: 'admin' }).exec()) ??
    (await User.findOne({ role: 'superadmin' }).exec());

  for (let i = 1; i <= 10; i++) {
    const email = `alumni${i}@crs.local`;
    const profile = alumniProfileByEmailSuffix[i];
    if (!profile) continue;

    try {
      const user = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
      if (!user) {
        console.warn(`[seed] Alumni profile skipped — user not found: ${email}`);
        continue;
      }

      const existing = await Alumni.findOne({ user: user._id });
      if (existing) {
        out.alumniSkipped++;
        continue;
      }

      await Alumni.create({
        user: user._id,
        ...profile,
      });
      out.alumniCreated++;
      console.log(`[seed] Created Alumni profile for ${email}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[seed] Alumni seed error (${email}):`, msg);
      out.modelErrors++;
    }
  }

  if (!organizer) {
    console.warn('[seed] No hod/admin/superadmin — skipping Event seed.');
    return out;
  }

  for (const ev of seedEvents) {
    try {
      const dup = await Event.findOne({ title: ev.title, date: ev.date });
      if (dup) {
        out.eventsSkipped++;
        continue;
      }
      await Event.create({
        ...ev,
        organizer: organizer._id,
        meetLink: ev.meetLink || undefined,
        location: ev.location || undefined,
        description: ev.description,
      });
      out.eventsCreated++;
      console.log(`[seed] Created Event: ${ev.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[seed] Event seed error (${ev.title}):`, msg);
      out.modelErrors++;
    }
  }

  return out;
}

async function seedSiteConfigAndAuditLogs(): Promise<{
  siteConfig: string;
  auditLogsInserted: number;
}> {
  let siteConfigNote = '';
  await SiteConfig.getConfig();
  siteConfigNote = 'Ensured singleton SiteConfig document';

  const existingLogs = await AuditLog.countDocuments();
  if (existingLogs > 0) {
    return { siteConfig: siteConfigNote, auditLogsInserted: 0 };
  }

  const superAdmin = await User.findOne({ email: 'superadmin@crs.local' }).collation({
    locale: 'en',
    strength: 2,
  });

  await AuditLog.insertMany([
    {
      action: 'user.login',
      category: 'auth',
      actor: superAdmin?._id,
      actorEmail: superAdmin?.email ?? 'superadmin@crs.local',
      method: 'POST',
      path: '/api/v1/auth/login',
      statusCode: 200,
      ip: '127.0.0.1',
      userAgent: 'CRS-SeedScript/1.0',
      details: { source: 'seed' },
      createdAt: new Date(Date.now() - 86_400_000),
    },
    {
      action: 'user.list',
      category: 'user',
      actor: superAdmin?._id,
      actorEmail: superAdmin?.email ?? 'superadmin@crs.local',
      method: 'GET',
      path: '/api/v1/users',
      statusCode: 200,
      ip: '127.0.0.1',
      userAgent: 'CRS-SeedScript/1.0',
      details: { source: 'seed' },
      createdAt: new Date(Date.now() - 43_200_000),
    },
    {
      action: 'alumni.list',
      category: 'alumni',
      actor: superAdmin?._id,
      actorEmail: superAdmin?.email ?? 'superadmin@crs.local',
      method: 'GET',
      path: '/api/v1/alumni',
      statusCode: 200,
      ip: '127.0.0.1',
      userAgent: 'CRS-SeedScript/1.0',
      createdAt: new Date(Date.now() - 3600_000),
    },
  ]);

  console.log('[seed] Inserted sample AuditLog entries');
  return { siteConfig: siteConfigNote, auditLogsInserted: 3 };
}

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('[seed] Connected to MongoDB');

  const results = { created: 0, skipped: 0, errors: 0 };

  for (const seedUser of seedUsers) {
    try {
      const existing = await User.findOne({ email: seedUser.email }).collation({
        locale: 'en',
        strength: 2,
      });

      if (existing) {
        console.log(`[seed] Skipping existing user: ${seedUser.email} (${seedUser.role})`);
        results.skipped++;
        continue;
      }

      const user = await User.create({
        name: seedUser.name,
        email: seedUser.email,
        password: DUMMY_PASSWORD,
        role: seedUser.role,
      });

      console.log(`[seed] Created user: ${user.email} [${user.role}] (id: ${user._id})`);
      results.created++;
    } catch (err: any) {
      console.error(`[seed] Error creating ${seedUser.email}:`, err.message || err);
      results.errors++;
    }
  }

  const modelSeed = await seedAlumniAndEvents();
  const siteAudit = await seedSiteConfigAndAuditLogs();

  console.log('\n[seed] ── Users ─────────────────────────────────');
  console.log(`[seed]  Created : ${results.created}`);
  console.log(`[seed]  Skipped : ${results.skipped}`);
  console.log(`[seed]  Errors  : ${results.errors}`);
  console.log(`[seed]  Total   : ${seedUsers.length}`);

  console.log('\n[seed] ── Alumni ────────────────────────────────');
  console.log(`[seed]  Created : ${modelSeed.alumniCreated}`);
  console.log(`[seed]  Skipped : ${modelSeed.alumniSkipped}`);

  console.log('\n[seed] ── Events ────────────────────────────────');
  console.log(`[seed]  Created : ${modelSeed.eventsCreated}`);
  console.log(`[seed]  Skipped : ${modelSeed.eventsSkipped}`);
  console.log(`[seed]  Model errors : ${modelSeed.modelErrors}`);

  console.log('\n[seed] ── SiteConfig / Audit ───────────────────');
  console.log(`[seed]  ${siteAudit.siteConfig}`);
  console.log(`[seed]  Audit samples inserted : ${siteAudit.auditLogsInserted}`);

  if (results.errors > 0 || modelSeed.modelErrors > 0) {
    console.warn('[seed] WARNING: Some records failed. Fix issues and run again.');
    process.exitCode = 1;
  } else {
    console.log('[seed] Seed completed successfully.');
  }

  await mongoose.disconnect();
  console.log('[seed] Disconnected from MongoDB');
}

seed().catch((err: any) => {
  console.error('[seed] Unexpected error:', err.message || err);
  process.exit(1);
});
