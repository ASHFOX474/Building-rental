import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/public/HomePage.jsx';
import FloorMapPage from './pages/public/FloorMapPage.jsx';
import './styles/theme.css';

// TODO: replace placeholders with real pages
const Placeholder = ({ title }) => <h1 style={{ padding: 24 }}>{title}</h1>;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/floor/:floorNumber" element={<FloorMapPage />} />
        <Route path="/flat/:flatId" element={<Placeholder title="ফ্ল্যাটের বিস্তারিত" />} />
        <Route path="/admin/*" element={<Placeholder title="অ্যাডমিন প্যানেল" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
