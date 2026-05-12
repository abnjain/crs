#!/usr/bin/env tsx
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User } from '../models/User.js';

function usage() {
  console.error('Usage: tsx src/scripts/createUser.ts --name "Full Name" --email email@example.com --password secret [--role X | --roles "a,b,c"]');
  console.error('  --role: single role (superadmin|admin|hod|faculty|alumni)');
  console.error('  --roles: comma-separated roles for multi-role user (e.g. "superadmin,hod")');
  process.exit(1);
}

function getArg(nameShort: string, nameLong: string) {
  const argv = process.argv;
  const i = argv.indexOf(nameShort);
  if (i !== -1 && argv[i + 1]) return argv[i + 1];
  const j = argv.indexOf(nameLong);
  if (j !== -1 && argv[j + 1]) return argv[j + 1];
  // fallback: look for `--key=value` style
  const longPrefix = nameLong + '=';
  for (const a of argv) {
    if (a.startsWith(longPrefix)) return a.slice(longPrefix.length);
  }
  return undefined;
}

function hasFlag(name: string) {
  const argv = process.argv;
  if (argv.includes(name)) return true;
  // Some runners (npm) may pass args differently; check joined string as fallback
  return process.argv.join(' ').includes(name);
}

const VALID_ROLES = ['superadmin', 'admin', 'hod', 'faculty', 'alumni'];

async function main() {
  const name = getArg('-n', '--name');
  const email = getArg('-e', '--email');
  const password = getArg('-p', '--password');
  const roleArg = getArg('-r', '--role');
  const rolesArg = getArg('-R', '--roles');
  const doSeed = hasFlag('--seed');

  if (!doSeed && (!name || !email || !password)) {
    usage();
  }

  let role = roleArg || 'alumni';
  let roles: string[] | undefined;
  if (rolesArg) {
    roles = rolesArg.split(',').map((r) => r.trim()).filter(Boolean);
    const invalid = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalid.length) {
      console.error('Invalid roles:', invalid.join(', '), '— must be one of:', VALID_ROLES.join(', '));
      process.exit(1);
    }
  } else if (!VALID_ROLES.includes(role)) {
    console.error('Invalid role. Must be one of:', VALID_ROLES.join(', '));
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri, { dbName: undefined });
    console.log('Connected to MongoDB');

    if (doSeed) {
      const seedUsers = [
        { name: 'Super Admin', email: 'superadmin@crs.local', role: 'superadmin' },
        { name: 'Admin User', email: 'admin@crs.local', role: 'admin' },
        { name: 'HOD User', email: 'hod@crs.local', role: 'hod' },
        { name: 'Faculty One', email: 'faculty1@crs.local', role: 'faculty' },
        { name: 'Faculty Two', email: 'faculty2@crs.local', role: 'faculty' },
        { name: 'Alumni One', email: 'alumni1@crs.local', role: 'alumni' },
        { name: 'Alumni Two', email: 'alumni2@crs.local', role: 'alumni' },
      ];
      const pw = 'crs@123';
      for (const u of seedUsers) {
        const exists = await User.findOne({ email: u.email }).collation({ locale: 'en', strength: 2 });
        if (exists) {
          console.log('Skipping existing user:', u.email);
          continue;
        }
        const created = new User({ name: u.name, email: u.email, password: pw, role: u.role });
        await created.save();
        console.log('Created user:', { id: created._id.toString(), email: created.email, role: created.role });
      }
    } else {
      const existing = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
      if (existing) {
        console.error('User with this email already exists:', email);
        process.exit(1);
      }

      const user = roles?.length ? new User({ name, email, password, roles }) : new User({ name, email, password, role });
      await user.save();
      console.log('User created:', { id: user._id.toString(), email: user.email, roles: user.getEffectiveRoles() });
    }
  } catch (err: any) {
    console.error('Error creating user:', err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
