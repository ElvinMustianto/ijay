import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Relasi ke Image (gallery)
    // images: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Image',
    //   },
    // ],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexing biar query cepat
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sku: 1 });
productSchema.index({ companyId: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
