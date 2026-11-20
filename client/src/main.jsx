import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BuildingProvider } from './context/BuildingContext.jsx';
import HomePage from './pages/public/HomePage.jsx';
import FloorMapPage from './pages/public/FloorMapPage.jsx';
import FlatDetailsPage from './pages/public/FlatDetailsPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BuildingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/floor/:floorNumber" element={<FloorMapPage />} />
          <Route path="/flat/:flatId" element={<FlatDetailsPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </BuildingProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional
    });
  });
}
