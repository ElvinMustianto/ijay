import Company from '../models/company.js';

export const seedCompanies = async () => {
  console.log('Seeding companies...');

  await Company.deleteMany();

  const companies = [
    {
      name: 'PT Maju Sejahtera',
      email: 'maju.sejahtera@gmail.com',
      phone: '08123456789',
      industry: 'Logistik',
      address: {
        street: 'Jl. Sudirman No.10',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '400123',
      },
      location: {
        lat: -6.2001,
        lng: 106.8167,
      },
    },
  ];

  const result = await Company.create(companies);
  console.log(`${result.length} companies seeded`);
};
