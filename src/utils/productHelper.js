/**
 * Helper untuk transform response
 */
const mapProductResponse = (product) => ({
  id: product._id,
  name: product.name,
  sku: product.sku,
  description: product.description,
  price: product.price,
  discountPrice: product.discountPrice,
  stock: product.stock,
  isActive: product.isActive,
  companyName: product.companyId?.name || null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export default mapProductResponse;