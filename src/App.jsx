import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import MapComponent from './Map';
import SitePage from './Sites';
import logoSvg from './logo.svg'; // Replace with the actual SVG file path

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

const drawerOptions = [
  { name: 'Berthoud Summit', id: 'SNOTEL:335_CO_SNTL' },
  { name: 'Joe Wright', id: 'SNOTEL:551_CO_SNTL' },
  { name: 'Jones Pass', id: 'SNOTEL:970_CO_SNTL' },
  { name: 'Fremont Pass', id: 'SNOTEL:485_CO_SNTL' },
  { name: 'Porphyry Creek', id: 'SNOTEL:701_CO_SNTL' },
];

const App = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <Menu />
          </IconButton>
          <Link to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logoSvg} alt="Logo" style={{ height: '24px', marginRight: '8px' }} />
              <Typography variant="h6" color="inherit">
                <span style={{ fontFamily: 'Signika Negative', fontWeight: 'bold', fontSize: '1.2em' }}>snow</span>
              </Typography>
            </div>
          </Link>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={closeDrawer}>
        <List>
          <ListItem button component={Link} to="/" onClick={closeDrawer}>
            <ListItemText primary="Map" />
          </ListItem>
          <ListItem button onClick={closeDrawer}>
            <ListItemText primary="Favorites" />
          </ListItem>
          <List component="div" disablePadding>
            {drawerOptions.map((option) => (
              <ListItem
                key={option.id}
                button
                component={Link}
                to={`/sites/${option.id}`}
                onClick={closeDrawer}
                style={{ paddingLeft: '2em' }}
              >
                <ListItemText primary={option.name} />
              </ListItem>
            ))}
          </List>
        </List>
      </Drawer>
      <Router>
        <Route path="/" exact>
          <MapComponent />
        </Route>
        <Route path="/sites/:snotel_site_id" element={<SitePage />} />
      </Router>
    </ThemeProvider>
  );
};

export default App;
