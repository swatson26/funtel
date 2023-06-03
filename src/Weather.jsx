import React, { useEffect, useState } from 'react';
import { VictoryChart, VictoryLine, VictoryBar, VictoryPolarAxis, VictoryStack } from 'victory';
import { CircularProgress } from '@mui/material';

const WeatherForecast = ({ lat, lon }) => {
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        const pointsData = await pointsResponse.json();
        const forecastHourlyUrl = pointsData.properties.forecastHourly;

        const forecastHourlyResponse = await fetch(forecastHourlyUrl);
        const forecastHourlyData = await forecastHourlyResponse.json();
        const periods = forecastHourlyData.properties.periods;

        setForecastData(periods);
      } catch (error) {
        console.error('Error fetching weather forecast data:', error);
        setForecastData([]); // Set an empty array in case of error
      }
    };

    fetchForecastData();
  }, [lat, lon]);

  if (!forecastData) {
    return <CircularProgress />;
  }

  const temperatureData = forecastData.map(period => ({
    x: period.endTime,
    y: period.temperature
  }));

  const precipitationData = forecastData.map(period => ({
    x: period.endTime,
    y: period.probabilityOfPrecipitation.value
  }));

  const windData = forecastData.reduce((aggregatedData, period) => {
    const { windDirection, windSpeed } = period;
    const cardinalDirection = convertToCardinalDirection(windDirection);
    const windSpeedBin = getWindSpeedBin(windSpeed);

    if (!aggregatedData[cardinalDirection]) {
      aggregatedData[cardinalDirection] = {
        '0-5': 0,
        '5-15': 0,
        '15-25': 0,
        '>25': 0
      };
    }

    aggregatedData[cardinalDirection][windSpeedBin] += 1;

    return aggregatedData;
  }, {});

  const windDirectionData = Object.keys(windData).map(direction => ({
    direction,
    '0-5': windData[direction]['0-5'],
    '5-15': windData[direction]['5-15'],
    '15-25': windData[direction]['15-25'],
    '>25': windData[direction]['>25']
  }));

  return (
    <div>
      <VictoryChart>
        <VictoryLine data={temperatureData} />
      </VictoryChart>

      <VictoryChart>
        <VictoryBar data={precipitationData} />
      </VictoryChart>

      <VictoryChart polar>
        <VictoryPolarAxis dependentAxis style={{ axis: { stroke: 'none' }, tickLabels: { fill: 'none' }, grid: { stroke: 'grey', strokeDasharray: '4, 8' } }} />
        <VictoryPolarAxis tickValues={[0, 45, 90, 135, 180, 225, 270, 315]} />
        <VictoryStack colorScale={['#ad1b11', '#c43a31', '#dc7a6b', '#f6c5b2']}>
          {windDirectionData.map(({ direction, '0-5': bin1, '5-15': bin2, '15-25': bin3, '>25': bin4 }) => (
            <VictoryBar
              key={direction}
              data={[
                { x: direction, y: bin1 },
                { x: direction, y: bin2 },
                { x: direction, y: bin3 },
                { x: direction, y: bin4 }
              ]}
            />
          ))}
        </VictoryStack>
      </VictoryChart>
    </div>
  );
};

const convertToCardinalDirection = direction => {
  const directions = {
    N: 'N',
    NNE: 'NNE',
    NE: 'NE',
    ENE: 'ENE',
    E: 'E',
    ESE: 'ESE',
    SE: 'SE',
    SSE: 'SSE',
    S: 'S',
    SSW: 'SSW',
    SW: 'SW',
    WSW: 'WSW',
    W: 'W',
    WNW: 'WNW',
    NW: 'NW',
    NNW: 'NNW'
  };

  return directions[direction];
};

const getWindSpeedBin = speed => {
  if (speed <= 5) {
    return '0-5';
  } else if (speed <= 15) {
    return '5-15';
  } else if (speed <= 25) {
    return '15-25';
  } else {
    return '>25';
  }
};

export default WeatherForecast;
