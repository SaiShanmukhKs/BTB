import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import TenderList from './pages/tenders/TenderList';
import TenderDetails from './pages/tenders/TenderDetails';
import CreateTender from './pages/tenders/CreateTender';
import BidList from './pages/bids/BidList';
import BidDetails from './pages/bids/BidDetails';
import CreateBid from './pages/bids/CreateBid';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route path="/tenders" element={<TenderList />} />
                <Route path="/tenders/:id" element={<TenderDetails />} />
                <Route 
                  path="/tenders/create" 
                  element={
                    <PrivateRoute>
                      <CreateTender />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/bids/tender/:tenderId" 
                  element={
                    <PrivateRoute>
                      <BidList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/bids/:id" 
                  element={
                    <PrivateRoute>
                      <BidDetails />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/bids/create/:tenderId" 
                  element={
                    <PrivateRoute>
                      <CreateBid />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <ToastContainer position="bottom-right" />
        </Router>
      </Web3Provider>
    </AuthProvider>
  );
};

export default App;
