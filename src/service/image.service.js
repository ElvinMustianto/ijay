import cloudinary from '../config/cloudinary.js';
import Image from '../models/image.js';

export const uploadImages = async ({
  files,
  ownerType,
  ownerId,
  uploadedBy,
}) => {
  const images = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      { folder: ownerType.toLowerCase() }
    );

    const image = await Image.create({
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      width: result.width,
      height: result.height,
      ownerType,
      ownerId,
      uploadedBy,
      isPrimary: i === 0, // image pertama jadi primary
    });

    images.push(image);
  }

  return images;
};
