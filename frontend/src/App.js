import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import KnowYourEP from './pages/KnowYourEP';
import Report from './pages/Report';
import Simulator from './pages/Simulator';
import LearningBytes from './pages/LearningBytes';
import Training from './pages/Training';
import ExecutiveCoaching from './pages/ExecutiveCoaching';
import AuthCallback from './pages/AuthCallback';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/know-your-ep" element={<ProtectedRoute><KnowYourEP /></ProtectedRoute>} />
      <Route path="/report/:reportId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
      <Route path="/learning" element={<ProtectedRoute><LearningBytes /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
      <Route path="/coaching" element={<ProtectedRoute><ExecutiveCoaching /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
