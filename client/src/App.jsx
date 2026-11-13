import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import BrowsePage from './pages/BrowsePage';
import ItemDetailPage from './pages/ItemDetailPage';
import CreateReportPage from './pages/CreateReportPage';
import EditReportPage from './pages/EditReportPage';
import MyActivityPage from './pages/MyActivityPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-campus-bg text-campus-navy antialiased selection:bg-campus-accent/20 selection:text-campus-navy">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<BrowsePage />} />
                <Route path="/item/:id" element={<ItemDetailPage />} />
                <Route path="/item/:id/edit" element={<EditReportPage />} />
                <Route path="/report" element={<CreateReportPage />} />
                <Route path="/activity" element={<MyActivityPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<BrowsePage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
