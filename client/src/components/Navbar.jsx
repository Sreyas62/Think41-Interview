import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            MERN Shop
          </Typography>
          
          <Button 
            color="inherit" 
            component={RouterLink}
            to="/"
            sx={{ mx: 1 }}
          >
            Products
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<ShoppingCartIcon />}
            sx={{ ml: 1 }}
          >
            Cart (0)
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
