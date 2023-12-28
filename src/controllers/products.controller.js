const ProductDao = require("../dao/mongo/products.mongo");
const ProductsRepository = require("../repositories/products.repository");
const productDao = new ProductDao();
const productsRepository = new ProductsRepository(productDao);
const Product = require('../models/product.model.js');

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || "price";

    const result = await productsRepository.getProducts(page, limit, sortBy);

    res.json({
      products: result.products,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  const productId = req.params.pid;
  try {
    const result = await productsRepository.getProductById(productId);
    res.render("productDetail", { product: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const saveProduct = async (req, res) => {
  const newProduct = req.body;
  try {
    const result = await productsRepository.saveProduct(newProduct);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  try {
    const result = await productsRepository.updateProduct(productId, updatedProduct);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const result = await productsRepository.deleteProduct(productId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Encuentra el producto
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
  
      // Verifica los permisos para borrar
      if (req.user.role === 'premium' && req.user._id.toString() !== product.owner.toString()) {
        return res.status(403).json({ message: 'No tienes permiso para borrar este producto' });
      }
  
      // Borrar el producto
      await Product.findByIdAndDelete(productId);
  
      res.status(200).json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  };

module.exports = {
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  updateProduct,
};
