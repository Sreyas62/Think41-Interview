import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Fetch all products with optional filters
export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/products`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Get unique categories for filters
export const getCategories = async () => {
  try {
    const response = await getProducts();
    const categories = [...new Set(response.data.products.map(p => p.category))];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
