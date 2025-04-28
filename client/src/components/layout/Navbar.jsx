
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const authLinks = (
    <>
      <li className="px-3">
        <Link to="/dashboard" className="text-white hover:text-blue-200">
          Dashboard
        </Link>
      </li>
      <li className="px-3">
        <Link to="/tenders" className="text-white hover:text-blue-200">
          Tenders
        </Link>
      </li>
      {user && user.role === 'tenderer' && (
        <li className="px-3">
          <Link to="/tenders/create" className="text-white hover:text-blue-200">
            Create Tender
          </Link>
        </li>
      )}
      <li className="px-3">
        <Link to="/profile" className="text-white hover:text-blue-200">
          Profile
        </Link>
      </li>
      <li className="px-3">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
        >
          Logout
        </button>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="px-3">
        <Link to="/tenders" className="text-white hover:text-blue-200">
          Tenders
        </Link>
      </li>
      <li className="px-3">
        <Link to="/login" className="text-white hover:text-blue-200">
          Login
        </Link>
      </li>
      <li className="px-3">
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
        >
          Register
        </Link>
      </li>
    </>
  );

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          BlockBid
        </Link>
        <div>
          <ul className="flex items-center">
            {isAuthenticated ? authLinks : guestLinks}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
