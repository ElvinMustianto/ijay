import Product from '../models/product.js';
import Image from '../models/image.js';
import { uploadImages } from '../service/image.service.js';
import {
  success,
  badRequest,
  notFound,
  internalServerError,
} from '../utils/responseHelpers.js';

// Helper: konversi ObjectId ke string
const toStringId = (id) => (id ? id.toString() : null);

/**
 * CREATE PRODUCT + UPLOAD IMAGES
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, discountPrice } = req.body;

    if (!name || price === undefined) {
      return badRequest(res, 'Name dan price wajib diisi');
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      stock,
      createdBy: req.user.id,
    });

    let images = [];

    if (req.files && req.files.length > 0) {
      images = await uploadImages({
        files: req.files,
        ownerType: 'Product',
        ownerId: product._id,
        uploadedBy: req.user.id,
      });
    }

    // Konversi ke objek plain dengan ID sebagai string
    const productResponse = {
      ...product.toObject(),
      _id: toStringId(product._id),
      createdBy: toStringId(product.createdBy),
      images: images.map(img => ({
        ...img.toObject(),
        _id: toStringId(img._id),
        ownerId: toStringId(img.ownerId),
        uploadedBy: toStringId(img.uploadedBy),
      })),
    };

    return success(res, {
      code: 201,
      message: 'Product berhasil dibuat',
      data: productResponse, // ✅ gunakan "data"
    });
  } catch (error) {
    return internalServerError(res, 'Gagal membuat product', error);
  }
};

/**
 * GET PRODUCT LIST + GALLERY IMAGES
 */
/**
 * GET PRODUCT LIST + GALLERY IMAGES
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
      isActive: true,
    }).lean();

    // Kelompokkan gambar & konversi ID
    const imageMap = {};
    images.forEach((img) => {
      const ownerId = toStringId(img.ownerId);
      if (!imageMap[ownerId]) imageMap[ownerId] = [];
      imageMap[ownerId].push({
        ...img,
        _id: toStringId(img._id),
        ownerId: ownerId,
        uploadedBy: toStringId(img.uploadedBy),
      });
    });

    const result = products.map((product) => ({
      ...product,
      _id: toStringId(product._id),
      createdBy: toStringId(product.createdBy),
      images: imageMap[toStringId(product._id)] || [],
    }));

    return success(res, {
      message: 'Berhasil mengambil product',
       data: result, // ✅ INI ADALAH "data"
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

    const productResponse = {
      ...product,
      _id: toStringId(product._id),
      createdBy: toStringId(product.createdBy),
      images: images.map(img => ({
        ...img,
        _id: toStringId(img._id),
        ownerId: toStringId(img.ownerId),
        uploadedBy: toStringId(img.uploadedBy),
      })),
    };

    return success(res, {
      message: 'Berhasil mengambil detail product',
       data: productResponse, // ✅ "data" berisi objek produk
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

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.removeImageIds && Array.isArray(req.body.removeImageIds)) {
      await Image.deleteMany({
        _id: { $in: req.body.removeImageIds },
        ownerType: 'Product',
        ownerId: product._id,
      });
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await uploadImages({
        files: req.files,
        ownerType: 'Product',
        ownerId: product._id,
        uploadedBy: req.user.id,
      });
    }

    await product.save();

    // Ambil ulang gambar terbaru
    const updatedImages = await Image.find({
      ownerType: 'Product',
      ownerId: product._id,
      isActive: true,
    }).lean();

    const productResponse = {
      ...product.toObject(),
      _id: toStringId(product._id),
      createdBy: toStringId(product.createdBy),
      images: updatedImages.map(img => ({
        ...img,
        _id: toStringId(img._id),
        ownerId: toStringId(img.ownerId),
        uploadedBy: toStringId(img.uploadedBy),
      })),
    };

    return success(res, {
      message: 'Product berhasil diperbarui',
      data: productResponse, // ✅ "data"
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