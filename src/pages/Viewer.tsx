import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PresentationData } from '../types';
import { ChevronLeft, ChevronRight, Save, Printer, ArrowLeft } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function Viewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const presentation = location.state?.presentation as PresentationData;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!presentation?.id);

  if (!presentation) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">No presentation data found.</h2>
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 underline">Go back to Dashboard</button>
      </div>
    );
  }

  const themeClasses = {
    Minimalist: 'bg-white text-slate-900 font-sans',
    Cyberpunk: 'bg-slate-900 text-cyan-400 font-mono',
    Academic: 'bg-[#fdfbf7] text-slate-900 font-serif',
    Anime: 'bg-pink-50 text-purple-900 font-sans rounded-3xl border-4 border-pink-200'
  }[presentation.theme] || 'bg-white text-slate-900';

  const handleSave = async () => {
    if (!user || saved) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'presentations'), {
        ...presentation,
        userId: user.uid,
        createdAt: Date.now()
      });
      setSaved(true);
      presentation.id = docRef.id;
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save presentation.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const slide = presentation.slides[currentSlide];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Topbar (Hidden in print) */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center print:hidden">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-5 h-5" /> Dashboard
        </button>
        <div className="font-bold text-lg hidden sm:block">{presentation.title}</div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          {!saved && (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 print:p-0 print:block">
        {/* Slide Container */}
        <div className={`w-full max-w-5xl aspect-[16/9] shadow-2xl overflow-hidden flex flex-col md:flex-row print:shadow-none print:aspect-auto print:mb-8 ${themeClasses}`}>
          
          {/* Content Side */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 ${presentation.theme === 'Cyberpunk' ? 'text-pink-500' : ''}`}>
              {slide.title}
            </h2>
            <div className={`prose prose-sm sm:prose-lg max-w-none ${presentation.theme === 'Cyberpunk' ? 'prose-invert prose-p:text-cyan-100 prose-li:text-cyan-100' : ''}`}>
              <ReactMarkdown>{slide.content}</ReactMarkdown>
            </div>
          </div>

          {/* Image Side */}
          {slide.imageUrl && (
            <div className="flex-1 bg-slate-200 relative print:h-64 min-h-[250px] md:min-h-0">
              <img 
                src={slide.imageUrl} 
                alt={slide.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls (Hidden in print) */}
      <div className="bg-white border-t border-slate-200 p-4 flex justify-center items-center gap-8 print:hidden">
        <button 
          onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
          disabled={currentSlide === 0}
          className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <span className="font-medium text-slate-500">
          Slide {currentSlide + 1} of {presentation.slides.length}
        </span>
        <button 
          onClick={() => setCurrentSlide(s => Math.min(presentation.slides.length - 1, s + 1))}
          disabled={currentSlide === presentation.slides.length - 1}
          className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
