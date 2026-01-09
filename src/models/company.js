import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email tidak valid'],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: {
        type: String,
        default: 'Indonesia',
        trim: true,
      },
    },

    location: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
        validate: {
          validator: v => v === undefined || (typeof v === 'number' && !isNaN(v)),
          message: 'Latitude harus berupa angka valid',
        },
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
        validate: {
          validator: v => v === undefined || (typeof v === 'number' && !isNaN(v)),
          message: 'Longitude harus berupa angka valid',
        },
      },
    },

    industry: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // ✅ Field baru: Deskripsi, Visi, Misi
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      // opsional — tapi jika diisi, minimal 10 karakter
      validate: {
        validator: v => !v || v.length >= 10,
        message: 'Deskripsi minimal 10 karakter jika diisi',
      },
    },

    vision: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    mission: {
      type: [String], // ✅ Lebih baik sebagai array string (untuk poin misi)
      // Contoh: ["Melayani pelanggan dengan sepenuh hati", "Menjadi pemimpin industri ..."]
      trim: true,
      maxlength: 500,
      validate: {
        validator: v => Array.isArray(v) && v.every(item => item.length <= 500),
        message: 'Setiap poin misi maksimal 500 karakter',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🔍 Index opsional untuk pencarian
companySchema.index({ name: 'text', industry: 'text', description: 'text' });

const Company = mongoose.model('Company', companySchema);

export default Company;