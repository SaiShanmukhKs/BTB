import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-white shadow-md rounded p-6">
        <div className="mb-4">
          <p className="text-gray-600 font-semibold">Name:</p>
          <p className="text-lg">{user.name}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 font-semibold">Email:</p>
          <p className="text-lg">{user.email}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 font-semibold">Role:</p>
          <p className="text-lg capitalize">{user.role}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 font-semibold">Organization:</p>
          <p className="text-lg">{user.organization}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 font-semibold">Wallet Address:</p>
          <p className="text-lg break-all">{user.walletAddress}</p>
        </div>

        <div className="text-gray-400 text-sm mt-4">
          Account created at: {new Date(user.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
