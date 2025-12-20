import User from '../models/user.js';

export const seedUsers = async () => {
  console.log('Seeding users...');

  await User.deleteMany();

  const users = [
    {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'password123',
      isActive: true,
    },
  ];

  const result = await User.create(users);
  console.log(`${result.length} users seeded`);
};
