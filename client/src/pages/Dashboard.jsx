import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="text-center py-10">Loading user data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {user.role === 'tenderer' && (
          <div className="bg-blue-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Post New Tender</h2>
            <p className="mb-4">Create and manage tenders easily.</p>
            <Link
              to="/tenders/create"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Create Tender
            </Link>
          </div>
        )}

        {user.role === 'bidder' && (
          <div className="bg-green-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Browse Open Tenders</h2>
            <p className="mb-4">Find tenders and submit your bids.</p>
            <Link
              to="/tenders"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              View Tenders
            </Link>
          </div>
        )}

        <div className="bg-gray-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Manage Profile</h2>
          <p className="mb-4">Update your personal and organization details.</p>
          <Link
            to="/profile"
            className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
