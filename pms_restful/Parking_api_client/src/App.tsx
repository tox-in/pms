import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import LandingPage from './pages/LandingPage';
import { ParkingLotsPage } from './pages/ParkingLotsPage';
import { DashboardPage } from './pages/DashboardPage';
import ParkingRegistration from './pages/ParkingRegistration';
import AuthPage from './pages/AuthPage';
import { CarEntryPage } from './pages/CarEntryPage';
import { TicketPage } from './pages/TicketPage';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/auth';
import { CommonProvider } from './context';
import PrivateRoute from './components/PrivateRoute';
import { Navbar } from './components/layout/Navbar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CommonProvider>
            <Navbar>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/*" element={<Navigate to="/auth" replace />} />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } />
                <Route path="/parking-lots" element={
                  <PrivateRoute>
                    <ParkingLotsPage />
                  </PrivateRoute>
                } />
                <Route path="/parking/register" element={
                  <PrivateRoute>
                    <ParkingRegistration />
                  </PrivateRoute>
                } />
                <Route path="/car-entry" element={
                  <PrivateRoute>
                    <CarEntryPage />
                  </PrivateRoute>
                } />
                <Route path="/ticket/:ticketId" element={
                  <PrivateRoute>
                    <TicketPage />
                  </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Navbar>
          </CommonProvider>
        </AuthProvider>
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;