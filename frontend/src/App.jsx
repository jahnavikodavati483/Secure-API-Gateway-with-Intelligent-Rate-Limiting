import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/layout/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Keep this just in case other tabs change storage
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('privateKey');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F4F7FE] text-[#2B3674] font-sans selection:bg-[#4318FF]/20 selection:text-[#4318FF] flex flex-col">
        {/* Soft background glow accents, suitable for a light airy feel */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white rounded-full blur-[100px] opacity-80"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4318FF]/5 rounded-full blur-[80px]"></div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-bold text-sm rounded-2xl shadow-[0_12px_24px_rgba(112,144,176,0.15)] bg-white border border-[#E9EDF7] text-[#2B3674]',
            style: { padding: '16px 24px' },
            success: { iconTheme: { primary: '#05CD99', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#EE5D50', secondary: '#ffffff' } }
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar user={user} onLogout={handleLogout} />

          <main className="flex-1 w-full flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
            <Routes>
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/login" element={<div className="w-full flex justify-center mt-10"><Login /></div>} />
              <Route path="/register" element={<div className="w-full flex justify-center mt-10"><Register /></div>} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
