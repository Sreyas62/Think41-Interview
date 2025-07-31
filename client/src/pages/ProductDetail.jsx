import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, ShoppingCart } from '@mui/icons-material';
import { getProductById } from '../api/products';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data.data);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Card>
        <Grid container spacing={0}>
          {/* Image Placeholder Section */}
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              height: '100%', 
              minHeight: '300px',
              backgroundColor: 'grey.200', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'grey.500'
            }}>
              <Typography>Image Placeholder</Typography>
            </Box>
          </Grid>

          {/* Product Details Section */}
          <Grid item xs={12} md={7}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip label={product.category} color="primary" variant="outlined" />
                <Chip label={product.brand} variant="outlined" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${product.retail_price?.toFixed(2)}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>SKU:</strong> {product.sku}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Department:</strong> {product.department}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box display="flex" gap={2} mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Add to Cart
                </Button>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      {/* Related Products Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 5, mb: 2 }}>
        You May Also Like
      </Typography>
      <Box mb={4}>
        {/* TODO: Implement related products */}
        <Typography variant="body1" color="text.secondary">
          Related products will be displayed here.
        </Typography>
      </Box>
    </Container>
  );
};

export default ProductDetail;
