import Company from '../models/company.js';
import {
  success,
  badRequest,
  notFound,
  conflict,
  internalServerError,
} from '../utils/responseHelpers.js';

/**
 * CREATE COMPANY
 */
export const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address, industry } = req.body;

    if (!name || !email) {
      return badRequest(res, 'Nama dan email perusahaan wajib diisi');
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return conflict(res, 'Email perusahaan sudah terdaftar');
    }

    const company = await Company.create({
      name,
      email,
      phone,
      address,
      industry,
      createdBy: req.user?.id || null,
    });

    return success(res, {
      code: 201,
      message: 'Perusahaan berhasil dibuat',
      data: {
        id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        industry: company.industry,
        isActive: company.isActive,
        createdAt: company.createdAt,
      },
    });
  } catch (error) {
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
      data: companies,
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

    const company = await Company.findById(id);
    if (!company) {
      return notFound(res, 'Perusahaan tidak ditemukan');
    }

    return success(res, {
      message: 'Berhasil mengambil detail perusahaan',
      data: company,
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

    const company = await Company.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!company) {
      return notFound(res, 'Perusahaan tidak ditemukan');
    }

    return success(res, {
      message: 'Perusahaan berhasil diperbarui',
      data: company,
    });
  } catch (error) {
    return internalServerError(res, 'Gagal memperbarui perusahaan', error);
  }
};

/**
 * DELETE COMPANY
 */
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return notFound(res, 'Perusahaan tidak ditemukan');
    }

    return success(res, {
      message: 'Perusahaan berhasil dihapus',
    });
  } catch (error) {
    return internalServerError(res, 'Gagal menghapus perusahaan', error);
  }
};
