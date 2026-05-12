#!/usr/bin/env tsx
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { processScheduledAccountDeletions } from '../services/accountDeletion.service.js';

async function main() {
  try {
    await mongoose.connect(config.mongoUri, { dbName: undefined });
    const result = await processScheduledAccountDeletions();
    console.log(`Processed ${result.processed} scheduled deletions.`);
  } catch (err: any) {
    console.error('Account deletion job failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
