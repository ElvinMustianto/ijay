import mongoose from 'mongoose';
import Company from '../models/company.js';
import {
  success,
  badRequest,
  notFound,
  conflict,
  internalServerError,
} from '../utils/responseHelpers.js';

// Helper: sanitasi output
const sanitizeCompany = (company) => {
  if (!company) return null;
  return {
    id: company._id.toString(),
    name: company.name,
    email: company.email,
    phone: company.phone,
    address: company.address,
    location: company.location,
    industry: company.industry,
    description: company.description,
    vision: company.vision,
    mission: company.mission,
    isActive: company.isActive,
    createdAt: company.createdAt ? new Date(company.createdAt).toISOString() : null,
    updatedAt: company.updatedAt ? new Date(company.updatedAt).toISOString() : null,
  };
};

/**
 * CREATE COMPANY
 */
export const createCompany = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      location, 
      industry, 
      description, 
      vision, 
      mission 
    } = req.body;

    // ✅ Validasi wajib
    if (!name?.trim() || !email?.trim()) {
      return badRequest(res, 'Nama dan email perusahaan wajib diisi');
    }

    // Cek duplikat email
    const existingCompany = await Company.findOne({ email: email.trim().toLowerCase() });
    if (existingCompany) {
      return conflict(res, 'Email perusahaan sudah terdaftar');
    }

    // Buat dokumen baru (hindari field tambahan via spread req.body)
    const companyData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      address,
      location,
      industry: industry?.trim() || '',
      description: description?.trim() || '',
      vision: vision?.trim() || '',
      mission: Array.isArray(mission) ? mission.map(m => m?.trim() || '').filter(Boolean) : [],
      isActive: true,
      createdBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : null,
    };

    const company = await Company.create(companyData);

    return success(res, {
      code: 201,
      message: 'Perusahaan berhasil dibuat',
      data: sanitizeCompany(company),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return badRequest(res, Object.values(error.errors).map(e => e.message).join('; '));
    }
    return internalServerError(res, 'Gagal membuat perusahaan', error);
  }
};

/**
 * GET ALL COMPANIES
 */
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    return success(res, {
      message: 'Berhasil mengambil daftar perusahaan',
      total: companies.length,
      data: companies.map(sanitizeCompany),
    });
  } catch (error) {
    return internalServerError(res, 'Gagal mengambil data perusahaan', error);
  }
};

/**
 * GET COMPANY BY ID
 */
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, 'ID perusahaan tidak valid');
    }

    const company = await Company.findById(id);
    if (!company) {
      return notFound(res, 'Perusahaan tidak ditemukan');
    }

    return success(res, {
      message: 'Berhasil mengambil detail perusahaan',
      data: sanitizeCompany(company),
    });
  } catch (error) {
    return internalServerError(res, 'Gagal mengambil detail perusahaan', error);
  }
};

/**
 * UPDATE COMPANY
 */
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, 'ID perusahaan tidak valid');
    }

    const {
      name,
      email,
      phone,
      address,
      location,
      industry,
      description,
      vision,
      mission,
      isActive,
    } = req.body;

    // Jika email diubah, cek duplikat (kecuali milik diri sendiri)
    if (email) {
      const existing = await Company.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return conflict(res, 'Email perusahaan sudah digunakan oleh perusahaan lain');
      }
    }

    // Whitelist field yang boleh di-update
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone.trim() || '';
    if (address !== undefined) updateData.address = address;
    if (location !== undefined) updateData.location = location;
    if (industry !== undefined) updateData.industry = industry.trim() || '';
    if (description !== undefined) updateData.description = description.trim() || '';
    if (vision !== undefined) updateData.vision = vision.trim() || '';
    if (mission !== undefined) {
      updateData.mission = Array.isArray(mission)
        ? mission.map(m => m?.trim() || '').filter(Boolean)
        : [];
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    updateData.updatedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : null;

    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // ✅ jalankan validator schema
    );

    if (!company) {
      return notFound(res, 'Perusahaan tidak ditemukan');
    }

    return success(res, {
      message: 'Perusahaan berhasil diperbarui',
      data: sanitizeCompany(company),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return badRequest(res, Object.values(error.errors).map(e => e.message).join('; '));
    }
    if (error.name === 'CastError') {
      return badRequest(res, 'ID atau data tidak valid');
    }
    return internalServerError(res, 'Gagal memperbarui perusahaan', error);
  }
};

/**
 * DELETE COMPANY (Soft Delete direkomendasikan, tapi ini hard delete sesuai permintaan)
 */
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, 'ID perusahaan tidak valid');
    }

    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return notFound(res, 'Perusahaan tidak ditemukan');
    }

    return success(res, {
      message: 'Perusahaan berhasil dihapus',
      data: { id: company._id.toString() },
    });
  } catch (error) {
    return internalServerError(res, 'Gagal menghapus perusahaan', error);
  }
};