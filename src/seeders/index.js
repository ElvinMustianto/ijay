import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { seedCompanies } from './company.seeder.js';
import { seedUsers } from './user.seeder.js';

const runSeeder = async () => {
  try {
    await connectDB();

    await seedCompanies();
    await seedUsers();

    console.log('All seeders completed');
    process.exit();
  } catch (error) {
    console.error('Seeder failed', error);
    process.exit(1);
  }
};

runSeeder();
