import Product from '../models/product.js';
import Image from '../models/image.js';
import { uploadImages } from '../service/image.service.js';
import {
  success,
  badRequest,
  notFound,
  internalServerError,
} from '../utils/responseHelpers.js';

/**
 * CREATE PRODUCT + UPLOAD IMAGES
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, discountPrice } = req.body;

    // validasi
    if (!name || price === undefined) {
      return badRequest(res, 'Name dan price wajib diisi');
    }

    // 1️⃣ Create product
    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      stock,
      createdBy: req.user.id,
    });

    let images = [];

    // 2️⃣ Upload images via Image Service
    if (req.files && req.files.length > 0) {
      images = await uploadImages({
        files: req.files,
        ownerType: 'Product',
        ownerId: product._id,
        uploadedBy: req.user.id,
      });
    }

    // 3️⃣ Return product + images
    return success(res, {
      code: 201,
      message: 'Product berhasil dibuat',
      data: {
        ...product.toObject(), // agar bisa ditambahkan properti baru
        images: images || [],
      },
    });
  } catch (error) {
    return internalServerError(res, 'Gagal membuat product', error);
  }
};

/**
 * GET PRODUCT LIST + PRIMARY IMAGE
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const productIds = products.map((p) => p._id);

    const images = await Image.find({
      ownerType: 'Product',
      ownerId: { $in: productIds },
      isPrimary: true,
      isActive: true,
    }).lean();

    const imageMap = {};
    images.forEach((img) => {
      imageMap[img.ownerId.toString()] = img;
    });

    const result = products.map((product) => ({
      ...product,
      image: imageMap[product._id.toString()] || null,
    }));

    return success(res, {
      message: 'Berhasil mengambil product',
      data: result,
      total: result.length,
    });
  } catch (error) {
    return internalServerError(res, 'Gagal mengambil product', error);
  }
};

/**
 * GET PRODUCT DETAIL + GALLERY IMAGES
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product || !product.isActive) {
      return notFound(res, 'Product tidak ditemukan');
    }

    const images = await Image.find({
      ownerType: 'Product',
      ownerId: product._id,
      isActive: true,
    })
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();

    return success(res, {
      message: 'Berhasil mengambil detail product',
      data: {
        ...product,
        images,
      },
    });
  } catch (error) {
    return internalServerError(res, 'Gagal mengambil product', error);
  }
};

/**
 * UPDATE PRODUCT
 */
export const updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'description',
      'price',
      'discountPrice',
      'stock',
      'isActive',
    ];

    const product = await Product.findById(req.params.id);

    if (!product) {
      return notFound(res, 'Product tidak ditemukan');
    }

    // 1️⃣ Update field yang diizinkan
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // 2️⃣ Hapus gambar lama jika ada
    if (req.body.removeImageIds && Array.isArray(req.body.removeImageIds)) {
      await deleteImages(req.body.removeImageIds);
      // filter images di product jika ada relasi array
      if (product.images && Array.isArray(product.images)) {
        product.images = product.images.filter(
          (img) => !req.body.removeImageIds.includes(img._id.toString())
        );
      }
    }

    // 3️⃣ Upload gambar baru jika ada
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await uploadImages({
        files: req.files,
        ownerType: 'Product',
        ownerId: product._id,
        uploadedBy: req.user.id,
      });
      // gabungkan dengan images lama
      product.images = [...(product.images || []), ...newImages];
    }

    // 4️⃣ Simpan perubahan product
    await product.save();

    return success(res, {
      message: 'Product berhasil diperbarui',
      data: product,
    });
  } catch (error) {
    return internalServerError(res, 'Gagal update product', error);
  }
};


/**
 * DELETE PRODUCT (SOFT DELETE)
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return notFound(res, 'Product tidak ditemukan');
    }

    product.isActive = false;
    await product.save();

    // Nonaktifkan semua image product
    await Image.updateMany(
      { ownerType: 'Product', ownerId: product._id },
      { isActive: false }
    );

    return success(res, {
      message: 'Product berhasil dihapus',
    });
  } catch (error) {
    return internalServerError(res, 'Gagal menghapus product', error);
  }
};
