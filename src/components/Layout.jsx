import React from 'react';
import Navbar from './Navbar.jsx';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 p-4">
        <Outlet />
      </main>
    </div>
  );
}
