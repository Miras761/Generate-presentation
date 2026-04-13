import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Log out
          </button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-600">Welcome, {user?.email}!</p>
          <p className="mt-4 text-sm text-slate-500">Dashboard implementation coming in Step 3.</p>
        </div>
      </div>
    </div>
  );
}
