import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import SitePage from './Sites';

createRoot(document.getElementById('root')).render(
  <Router>
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sites/:snotel_site_id" element={<SitePage />} />
      </Routes>
    </React.StrictMode>
  </Router>,
  document.getElementById('root')
);

reportWebVitals();
