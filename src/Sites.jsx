import React, { useEffect, useState } from 'react';
import { Typography, Divider, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryVoronoiContainer, VictoryTooltip, VictoryLabel } from 'victory';
import axios from 'axios';
import SnowAppBar from './AppBar'; 
import Weather from './Weather';

const SitePage = () => {
  const { snotel_site_id } = useParams();
  const [data, setData] = useState([]);
  const [stationName, setStationName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_HOST_BASE}/api/station/${snotel_site_id}/?time_offset_hrs=96`)
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
          setLat(lat);
          setLon(lon);
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

  if (data.length === 0) {
    return <div>Loading data...</div>;
  }

  const minSnowDepth = Math.min(...data.map((entry) => entry.snow_depth));
  const minTemp = Math.min(...data.map((entry) => entry.temp));
  const minYDomain = Math.min(minSnowDepth, minTemp);

  const maxSnowDepth = Math.max(...data.map((entry) => entry.snow_depth));
  const maxTemp = Math.max(...data.map((entry) => entry.temp));
  const maxYDomain = Math.max(maxSnowDepth, maxTemp);


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
                fontWeight: 'bold',
                marginLeft: '20px',
                marginTop: '20px',
              }}
            >
              Snow Depth for {stationName} Snotel
            </Typography>
            <VictoryChart
              containerComponent={
                <VictoryVoronoiContainer
                  voronoiDimension="x"
                  labels={({ datum }) => `Snow Depth: ${datum.snow_depth}\nTemperature: ${datum.temp}°F\nTime: ${new Date(datum.timestamp_station_local).toLocaleString()}`}
                  labelComponent={<VictoryTooltip cornerRadius={3} style={{ fontSize: 6 }} flyoutStyle={{ fill: 'white' }} />}
                />
              }
              style={{
                parent: { borderRadius: theme.shape.borderRadius },
              }}
              domain={{ y: [minYDomain-2,maxYDomain+2] }}
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
                x="timestamp_station_local"
                y="temp"
                style={{ data: { stroke: theme.palette.secondary.main } }}
              />
              <VictoryLine
                data={data}
                x="timestamp_station_local"
                y="snow_depth"
                style={{ data: { stroke: theme.palette.secondary.dark } }}
              />
            </VictoryChart>
          </div>
        </div>

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
                fontWeight: 'bold',
                marginLeft: '20px',
                marginTop: '20px',
              }}
            >
              Weather near {stationName} Snotel
            </Typography>
            {lat && lon && <Weather lat={lat} lon={lon} />}
          </div>
        </div>
      </Container>
    </ThemeProvider>
  );
};

export default SitePage;
