import React, { useEffect, useState } from 'react';
import { StaticMap, MapContext, NavigationControl } from 'react-map-gl';
import DeckGL, { ScatterplotLayer } from 'deck.gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const INITIAL_VIEW_STATE = {
  latitude: 39.094580,
  longitude: -106.355425,
  zoom: 6.5,
  bearing: 0,
  pitch: 0
};
const MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v12';
const NAV_CONTROL_STYLE = {
  position: 'absolute',
  top: 10,
  left: 10
};

const colorScale = [
  [0, [88, 0, 0]],
  [10, [151, 86, 62]],
  [20, [223, 202, 172]],
  [30, [255, 255, 224]],
  [40, [212, 218, 217]],
  [60, [109, 144, 203]],
  [100, [0, 85, 255]]
];

const MapComponent = () => {
  const [stationData, setStationData] = useState([]);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_HOST_BASE}/api/stations/`)
      .then((response) => {
        setStationData(response.data);
      })
      .catch((error) => console.error('Error fetching station data:', error));
  }, []);

  const navigate = useNavigate();
  
  const handleHover = ({ x, y, object }) => {
    setHoveredObject(object);
    setHoveredPosition({ x, y });
  };

  const filteredData = stationData.filter((d) => {
    const timestamp = new Date(d.latest_timestamp).getTime();
    const TimeCutoff = Date.now() - 5 * 24 * 60 * 60 * 1000;
    return timestamp > TimeCutoff;
  });

  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: filteredData,
    getPosition: (d) => [d.lon, d.lat],
    getFillColor: (d) => {
      const scaledValue = (d.latest_snow_depth / 60) * 100;
      const [value1, color1] = colorScale.find(([value]) => value >= scaledValue) || [];
      const [value0, color0] = colorScale.find(([value]) => value < scaledValue) || [];
      if (value1 !== undefined && value0 !== undefined) {
        const t = (scaledValue - value0) / (value1 - value0);
        const color = color0.map((c, index) => Math.round((1 - t) * c + t * color1[index]));
        return color;
      }
      return [88,0,0]; // Default
    },
    getLineColor: [0, 0, 0], // Black border color
    lineWidthMinPixels: 1, // Border line width
    pickable: true,
    stroked: true,
    radiusScale: { type: 'linear', field: 'zoom', domain: [6, 18], range: [6, 2] },
    radiusMinPixels: 6,
    radiusMaxPixels: 6,
    onHover: handleHover,
    onClick: (info) => {
      const { object } = info;
      if (object) {
        navigate(`/sites/${object.site_id}`);
      }
    }
  });

  return (
    <div>
       
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[scatterplotLayer]}
        ContextProvider={MapContext.Provider}
      >
        <StaticMap 
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        mapStyle={MAP_STYLE} />
        <NavigationControl style={NAV_CONTROL_STYLE} />
        {hoveredObject && (
          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              pointerEvents: 'none',
              left: hoveredPosition.x + 10,
              top: hoveredPosition.y + 10,
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>{hoveredObject.name}</div>
            <div>Elevation (meters): {hoveredObject.elevation_m}</div>
            <div>Snow Level (inches): {hoveredObject.latest_snow_depth}</div>
            <div>Timestamp: {hoveredObject.latest_timestamp}</div>
          </div>
        )}
      </DeckGL>
    </div>
  );
};

export default MapComponent;
