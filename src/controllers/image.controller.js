import Image from '../models/image.js';
import cloudinary from '../config/cloudinary.js';
import { success, notFound, internalServerError } from '../utils/responseHelpers.js';

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return notFound(res, 'Image tidak ditemukan');

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await image.deleteOne();

    return success(res, { message: 'Image berhasil dihapus' });
  } catch (error) {
    return internalServerError(res, 'Gagal menghapus image', error);
  }
};

export const setPrimaryImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return notFound(res, 'Image tidak ditemukan');

    await Image.updateMany(
      { ownerType: image.ownerType, ownerId: image.ownerId },
      { isPrimary: false }
    );

    image.isPrimary = true;
    await image.save();

    return success(res, { message: 'Primary image diperbarui' });
  } catch (error) {
    return internalServerError(res, 'Gagal set primary image', error);
  }
};
