import Product from '../models/product.js';
import Company from '../models/company.js';
import {
  success,
  badRequest,
  notFound,
  conflict,
  internalServerError,
} from '../utils/responseHelpers.js';
import mapProductResponse from '../utils/productHelper.js';

/**
 * CREATE PRODUCT
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      isActive,
    } = req.body;

    if (!name || !price) {
      return badRequest(res, 'Nama produk, harga, dan companyName wajib diisi');
    }

    let product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      stock,
      isActive,
      createdBy: req.user?.id || null,
    });

    return success(res, {
      code: 201,
      message: 'Produk berhasil dibuat',
      data: mapProductResponse(product),
    });
  } catch (error) {
    return internalServerError(res, 'Gagal membuat produk', error);
  }
};

/**
 * GET ALL PRODUCTS
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(filter)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    return success(res, {
      message: 'Berhasil mengambil daftar produk',
      total: products.length,
      data: products.map(mapProductResponse),
    });
  } catch (error) {
    return internalServerError(res, 'Gagal mengambil data produk', error);
  }
};

/**
 * GET PRODUCT BY ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('companyId', 'name');

    if (!product) {
      return notFound(res, 'Produk tidak ditemukan');
    }

    return success(res, {
      message: 'Berhasil mengambil detail produk',
      data: mapProductResponse(product),
    });
  } catch (error) {
    return internalServerError(res, 'Gagal mengambil detail produk', error);
  }
};

/**
 * UPDATE PRODUCT
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    let product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('name');

    if (!product) {
      return notFound(res, 'Produk tidak ditemukan');
    }

    return success(res, {
      message: 'Produk berhasil diperbarui',
      data: mapProductResponse(product),
    });
  } catch (error) {
    return internalServerError(res, 'Gagal memperbarui produk', error);
  }
};

/**
 * DELETE PRODUCT
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return notFound(res, 'Produk tidak ditemukan');
    }

    return success(res, {
      message: 'Produk berhasil dihapus',
    });
  } catch (error) {
    return internalServerError(res, 'Gagal menghapus produk', error);
  }
};
