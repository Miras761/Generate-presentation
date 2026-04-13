import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePresentationStructure, generateImage } from '../services/aiService';
import LoadingScreen from '../components/LoadingScreen';
import { PresentationData, Slide } from '../types';
import { ArrowRight, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

const THEMES = [
  { id: 'Minimalist', desc: 'Clean, white/gray, professional' },
  { id: 'Cyberpunk', desc: 'Dark, neon, futuristic' },
  { id: 'Academic', desc: 'Serif, elegant, traditional' },
  { id: 'Anime', desc: 'Creative, vibrant, illustrated' }
];

const LANGUAGES = ['English', 'Русский', 'Қазақ тілі'];

export default function Wizard() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Minimalist');
  
  const [loadingStep, setLoadingStep] = useState<'none' | 'text' | 'images'>('none');
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setError('');
      setLoadingStep('text');
      
      // Step A: Generate text structure
      const structure = await generatePresentationStructure(topic, language);
      
      if (!structure || !structure.slides || structure.slides.length === 0) {
        throw new Error("Invalid structure returned from AI");
      }

      setLoadingStep('images');
      
      // Step B: Generate images
      const slidesWithImages: Slide[] = await Promise.all(
        structure.slides.map(async (slide: Slide) => {
          try {
            const imageUrl = await generateImage(slide.image_prompt_english, theme);
            return { ...slide, imageUrl };
          } catch (imgErr) {
            console.error("Image generation failed for slide", imgErr);
            return slide; // Fallback without image
          }
        })
      );

      const presentationData: PresentationData = {
        title: structure.title,
        topic,
        language,
        theme,
        slides: slidesWithImages
      };

      setLoadingStep('none');
      navigate('/view', { state: { presentation: presentationData } });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate presentation. Please check API keys.");
      setLoadingStep('none');
    }
  };

  if (loadingStep !== 'none') {
    return <LoadingScreen step={loadingStep} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-8">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Create Presentation</h1>
          <p className="text-lg text-slate-600">Configure your AI-generated deck</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate} className="bg-white shadow-sm rounded-2xl p-8 border border-slate-100">
          {/* Topic */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              What is the topic?
            </label>
            <textarea
              required
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., История Казахстана, The Future of AI, Quantum Physics..."
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Language */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Language
            </label>
            <div className="grid grid-cols-3 gap-4">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                    language === lang 
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-10">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Visual Theme
            </label>
            <div className="grid grid-cols-2 gap-4">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    theme === t.id 
                      ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`font-bold mb-1 ${theme === t.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {t.id}
                  </div>
                  <div className={`text-sm ${theme === t.id ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Generate Presentation
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
