import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    filename: {
      type: String,
      trim: true,
    },

    mimetype: {
      type: String,
      trim: true,
    },

    size: {
      type: Number, // bytes
    },

    width: {
      type: Number,
    },

    height: {
      type: Number,
    },

    altText: {
      type: String,
      trim: true,
    },

    ownerType: {
      type: String,
      enum: ['Company', 'User', 'Product'],
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ownerType',
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

imageSchema.index({ ownerType: 1, ownerId: 1 });
imageSchema.index({ isPrimary: 1 });

const Image = mongoose.model('Image', imageSchema);

export default Image;
