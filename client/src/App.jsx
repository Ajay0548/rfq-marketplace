import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import MyRFQs from './pages/buyer/MyRFQs';
import CreateRFQ from './pages/buyer/CreateRFQ';
import EditRFQ from './pages/buyer/EditRFQ';
import RFQDetails from './pages/buyer/RFQDetails';
import ViewQuotations from './pages/buyer/ViewQuotations';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import BrowseRFQs from './pages/supplier/BrowseRFQs';
import SupplierRFQDetails from './pages/supplier/SupplierRFQDetails';
import MyQuotations from './pages/supplier/MyQuotations';

// Utility Pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Buyer Routes */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <MyRFQs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/create"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <CreateRFQ />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/:id"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <RFQDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <EditRFQ />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/:id/quotations"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <ViewQuotations />
                  </ProtectedRoute>
                }
              />

              {/* Protected Supplier Routes */}
              <Route
                path="/supplier/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SUPPLIER']}>
                    <SupplierDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier/rfqs"
                element={
                  <ProtectedRoute allowedRoles={['SUPPLIER']}>
                    <BrowseRFQs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier/rfqs/:id"
                element={
                  <ProtectedRoute allowedRoles={['SUPPLIER']}>
                    <SupplierRFQDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier/quotations"
                element={
                  <ProtectedRoute allowedRoles={['SUPPLIER']}>
                    <MyQuotations />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
