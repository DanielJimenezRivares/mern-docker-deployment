import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CorkboardView from './components/CorkboardView.jsx';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('cork_token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route
      path="/"
      element={
        <PrivateRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </PrivateRoute>
      }
    />

    <Route
      path="/boards/:boardId"
      element={
        <PrivateRoute>
          <Layout>
            <CorkboardView />
          </Layout>
        </PrivateRoute>
      }
    />
  </Routes>
);

export default App;
