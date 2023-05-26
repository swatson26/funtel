import React, { useEffect, useState } from 'react';
import { Typography, Button, Menu, MenuItem, Divider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MapComponent from './Map';
import { Link, Routes, Route } from 'react-router-dom';
import SitePage from './Sites';
import './assets/fonts.css';
import { ReactComponent as Logo } from './assets/mtn.svg';



const App = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const favorites = [
    { name: 'Berthoud Summit', id: 'SNOTEL:335_CO_SNTL' },
    { name: 'Joe Wright', id: 'SNOTEL:551_CO_SNTL' },
    { name: 'Jones Pass', id: 'SNOTEL:970_CO_SNTL' },
    { name: 'Fremont Pass', id: 'SNOTEL:485_CO_SNTL' },
    { name: 'Porphyry Creek', id: 'SNOTEL:701_CO_SNTL' },
  ];

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const handleMenuClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

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
      },
    },
    typography: {
        fontFamily: 'Open Sans, sans-serif',
    },
    shape: {
      borderRadius: 8, // Set the border radius for components
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <header
        style={{
          backgroundColor: theme.palette.background.default,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '3em',
            marginRight: '5px',
          }}
        >
          <Logo
            style={{
              width: 'auto',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
        <Typography
          variant="h1"
          component="h1"
          style={{
            color: theme.palette.primary.main,
            fontFamily: 'Signika Negative, sans-serif',
            fontWeight: 'bold',
            fontSize: '4rem',
            marginLeft: '5px',
          }}
        >
          snow
          </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleMenuClick}
          style={{
            color: theme.palette.primary.main,
            border: `2px solid ${theme.palette.secondary.light}`,
            fontSize: '0.8rem',
            padding: '5px 10px',
            textTransform: 'lowercase',
            fontWeight: 'bold',
            marginLeft: 'auto',
          }}
        >
          favorites
        </Button>
        <Menu
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          anchorEl={null}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
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
      </header>

      <Divider />
      <div
        style={{
          padding: '0 20px',
          marginTop: '20px',
          fontFamily: 'Open Sans, sans-serif',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <div
          style={{
            height: 'calc(100vh - 140px)',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '14px', // Rounded corners around the map
          }}
        >
          {mapLoaded && <MapComponent style={{ height: '100%', width: '100%' }} />}
        </div>
      </div>
      <Routes>
        <Route path="/sites/:snotel_site_id" element={<SitePage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
