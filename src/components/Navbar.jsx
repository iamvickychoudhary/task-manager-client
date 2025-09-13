import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ brand = "TaskManager", links = [{ name: "Dashboard", path: "/" }] }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-2xl font-bold hover:text-gray-200 transition-colors"
        >
          {brand}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-4">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="hover:text-gray-200 transition-colors"
          >
            {link.name}
          </Link>
        ))}

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
