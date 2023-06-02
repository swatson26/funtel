import './assets/fonts.css';
import React, { useEffect, useState } from 'react';
import SnowAppBar from './AppBar'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Divider, Container } from '@mui/material';
import MapComponent from './Map';


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



const App = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    setMapLoaded(true);
  }, []);

return (
  <ThemeProvider theme={theme}>
    <SnowAppBar /> 
    <Divider />
    <Container>
    {mapLoaded && <MapComponent style={{ height: '100%', width: '100%' }} />}
    </Container>

          




  </ThemeProvider>
);
};

export default App;