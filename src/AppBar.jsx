import './assets/fonts.css';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ReactComponent as Logo } from './assets/mtn.svg';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Routes, Link, Route } from 'react-router-dom';


const theme = createTheme({
  palette: {
    background: {
      default: '#FFFF',
    },
    primary: {
      main: '#274690',
      light: '#576CA8',
      dark: '#1B264F',
    },
    secondary: {
      main: '#1B264F',
      light: '#F3EFEB',
    }
  },
  typography: {
    fontFamily: 'Open Sans, sans-serif',
  },
  shape: {
    borderRadius: 8, // Set the border radius for components
  },
});

const favorites = [
  { name: 'Berthoud Summit', id: 'SNOTEL:335_CO_SNTL' },
  { name: 'Joe Wright', id: 'SNOTEL:551_CO_SNTL' },
  { name: 'Jones Pass', id: 'SNOTEL:970_CO_SNTL' },
  { name: 'Fremont Pass', id: 'SNOTEL:485_CO_SNTL' },
  { name: 'Porphyry Creek', id: 'SNOTEL:701_CO_SNTL' },
];

function SitePage() {
  return <Typography variant="h3">Site Page</Typography>;
}

function SnowAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleFavoritesClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
        <AppBar position="sticky" sx={{ background: theme.palette.secondary.light }}>
          <Toolbar disableGutters>
            <Logo style={{ height: '2rem', width: 'auto' }} />
            <Typography
              variant="h3"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 'auto',
                display: 'flex',
                fontFamily: 'Signika Negative, sans-serif',
                fontWeight: 700,
                color: theme.palette.primary.main,
                textDecoration: 'none',
              }}
            >
              snow
            </Typography>
            <Box>
              <Button
                onClick={handleFavoritesClick}
                sx={{
                  my: 2,
                  mx: 1,
                  color: theme.palette.primary.main,
                  textTransform: 'lowercase',
                  fontWeight: 'bold'

                }}
              >
                <Typography>
                  Favorites
                </Typography>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
              >
                {favorites.map((favorite) => (
                  <MenuItem
                    key={favorite.id}
                    component={Link}
                    to={`/sites/${favorite.id}`}
                    onClick={handleMenuClose}
                  >
                    {favorite.name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
        <Route path="/sites/:snotel_site_id/*" component={SitePage} />
        </Routes>
    </ThemeProvider>
  );
}

export default SnowAppBar;