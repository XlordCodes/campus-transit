import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BusProvider } from './context/BusProvider';
import Login from './pages/Login';
import Driver from './pages/Driver';
import Student from './pages/Student';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <BusProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/driver" element={<Layout><Driver /></Layout>} />
          <Route path="/student" element={<Layout><Student /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BusProvider>
    </BrowserRouter>
  );
};

export default App;
