import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { PresentationData } from '../types';
import { Plus, Presentation, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState<PresentationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPresentations() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'presentations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data: PresentationData[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as PresentationData);
        });
        setPresentations(data);
      } catch (error) {
        console.error("Error fetching presentations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPresentations();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <Link 
            to="/create"
            className="group flex flex-col items-center justify-center h-64 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900">Create New</h3>
            <p className="text-indigo-600 text-sm mt-1">Generate with AI</p>
          </Link>

          {/* Saved Presentations */}
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>
          ) : (
            presentations.map((pres) => (
              <div key={pres.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-64 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Presentation className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{pres.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-auto">
                  <span className="px-2 py-1 bg-slate-100 rounded-md">{pres.theme}</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-md">{pres.language}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(pres.createdAt || 0).toLocaleDateString()}
                  </div>
                  <Link 
                    to={`/view`} 
                    state={{ presentation: pres }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
