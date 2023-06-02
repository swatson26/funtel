import React, { useEffect, useState } from 'react';
import { Typography, Divider, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryVoronoiContainer, VictoryTooltip, VictoryLabel } from 'victory';
import axios from 'axios';
import SnowAppBar from './AppBar'; 

const SitePage = () => {
  const { snotel_site_id } = useParams();
  const [data, setData] = useState([]);
  const [stationName, setStationName] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_HOST_BASE}/api/station/${snotel_site_id}/?time_offset_hrs=72`)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => console.error('Error fetching data:', error));

    axios.get(`${process.env.REACT_APP_HOST_BASE}/api/stations/`)
      .then((response) => {
        const stationsData = response.data;
        const station = stationsData.find((station) => station.site_id === snotel_site_id);
        if (station) {
          setStationName(station.name); 
          const { lat, lon } = station;
        }
      });
  }, [snotel_site_id]);

  const getXAxisTickCount = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1200) {
      return 14; // Adjust the value as needed for the desired number of labels
    } else if (screenWidth >= 768) {
      return 7; // Adjust the value as needed for the desired number of labels
    } else {
      return 5; // Adjust the value as needed for the desired number of labels
    }
  };

  const theme = createTheme({
    palette: {
      background: {
        default: '#FFFFFF',
        dark: '#F3EFEB'
      },
      primary: {
        main: '#274690',
        light: '#576CA8',
        dark: '#1B264F'
      },
      secondary: {
        main: '#19A9A2',
        dark: '#7948F3'
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif', // Set the font family to Poppins
    },
    shape: {
      borderRadius: 2, // Set the border radius for components
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <SnowAppBar /> 
      <Divider />
      <Container>
      <div
        style={{
          padding: '0 10px',
          marginTop: '10px',
          marginBottom: '10px',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            background: theme.palette.background.dark,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '14px', // Rounded corners around the map
            margin: '0 auto', // Center the chart horizontally
          }}
        >
          <Typography
            variant="h5"
            component="h5"
            style={{
              color: theme.palette.primary.main,
              fontFamily: 'Open Sans, sans-serif',
              marginLeft: '20px',
              marginTop: '20px',
            }}
          >
            snow depth for {stationName} Snotel
          </Typography>
          <VictoryChart 
            containerComponent={<VictoryVoronoiContainer voronoiDimension="x" />}
            style={{
              parent: { borderRadius: theme.shape.borderRadius },
              
            }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t}°F`}
              style={{
                tickLabels: { fontSize: 10, fill: theme.palette.secondary.main },
                axisLabel: { padding: 0 },
                axis: { stroke: theme.palette.primary.main },
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
              labelPlacement="parallel"
            />
            <VictoryAxis
              dependentAxis
              offsetX={400}
              tickFormat={(t) => `${t} in`}
              style={{
                tickLabels: { fontSize: 10, fill: theme.palette.secondary.dark, textAnchor: 'start', padding: -5 },
                axisLabel: { padding: 10 },
                axis: { stroke: theme.palette.secondary.dark },
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
              labelPlacement="parallel"
            />
            <VictoryAxis
              tickFormat={(x) => new Date(x).toLocaleString()}
              style={{
                tickLabels: { fontSize: 5, angle: -40 },
                axisLabel: { padding: 0 },
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
              tickLabelComponent={
                <VictoryLabel
                  angle={-40}
                  dx={-24}
                  dy={0}
                />
              }
              tickCount={getXAxisTickCount()} // Set the number of x-axis labels based on screen width
            />
            <VictoryLine
              data={data}
              x="timestamp_utc"
              y="temp"
              style={{ data: { stroke: theme.palette.secondary.main } }}
              labelComponent={<VictoryTooltip style={{ fontSize: 8 }} flyoutStyle={{ fill: 'white' }} />}
              labels={({ datum }) => `Temp: ${datum.temp}°F\nTime: ${new Date(datum.timestamp_utc).toLocaleString()}`}
            />
            <VictoryLine
              data={data}
              x="timestamp_utc"
              y="snow_depth"
              style={{ data: { stroke: theme.palette.secondary.dark } }}
              labelComponent={<VictoryTooltip style={{ fontSize: 8 }} flyoutStyle={{ fill: 'white' }} />}
              labels={({ datum }) =>
                `Snow Depth: ${datum.snow_depth} in\nTime: ${new Date(datum.timestamp_utc).toLocaleString()}`
              }
            />
          </VictoryChart>
        </div>
      </div>

    </Container>
      
    </ThemeProvider>
  );
};

export default SitePage;