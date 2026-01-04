import React, { useState } from 'react';
import { AnalysisResult, LODLevel } from './types';
import { analyzeLODCompliance } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [lodTarget, setLodTarget] = useState<LODLevel>(LODLevel.LOD300);
  const [elementType, setElementType] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (base64: string, preview: string) => {
    setBase64Image(base64);
    setImagePreview(preview);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!base64Image) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeLODCompliance(base64Image, lodTarget, elementType, context);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze the model. Please check the image and try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setBase64Image(null);
    setImagePreview(null);
    setElementType('');
    setContext('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              LOD
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Checker AI</h1>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            BIM Compliance Assistant
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        
        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs mr-2 font-bold">1</span>
                  Upload Model View
                </h2>
                {!imagePreview ? (
                  <FileUpload onImageSelected={handleImageSelected} />
                ) : (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                    <button 
                      onClick={() => { setImagePreview(null); setBase64Image(null); }}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs mr-2 font-bold">2</span>
                  Configuration
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Level of Development</label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.values(LODLevel).map((level) => (
                        <button
                          key={level}
                          onClick={() => setLodTarget(level)}
                          className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all
                            ${lodTarget === level 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {lodTarget === LODLevel.LOD300 && "Geometry defined. Specific system. No bolts/welds."}
                      {lodTarget === LODLevel.LOD400 && "Fabrication ready. Bolts, welds, chamfers included."}
                      {lodTarget === LODLevel.LOD500 && "As-Built verified. Contains manufacturer info."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Element Category (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Structural Column, Air Handling Unit"
                      value={elementType}
                      onChange={(e) => setElementType(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Additional Context (Optional)</label>
                    <textarea 
                      placeholder="Describe what we are looking at or paste property parameters here..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!base64Image || loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all
                  ${!base64Image || loading 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01]'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Model Structure...
                  </span>
                ) : (
                  'Run Compliance Check'
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}
            </div>

            {/* Right Column: Info/Helper */}
            <div className="lg:col-span-5 space-y-6">
               <div className="bg-slate-900 text-slate-300 rounded-xl p-6 shadow-lg">
                 <h3 className="text-white font-bold text-lg mb-4">How it works</h3>
                 <ul className="space-y-4">
                   <li className="flex items-start">
                     <span className="bg-blue-500/20 text-blue-400 p-1 rounded mr-3 mt-1">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                     </span>
                     <div>
                       <strong className="text-white block text-sm">Visual Analysis</strong>
                       <span className="text-sm">The AI identifies fabrication details like bolts, plates, and clearances to determine geometric LOD.</span>
                     </div>
                   </li>
                   <li className="flex items-start">
                     <span className="bg-blue-500/20 text-blue-400 p-1 rounded mr-3 mt-1">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     </span>
                     <div>
                       <strong className="text-white block text-sm">Parameter Inference</strong>
                       <span className="text-sm">We infer missing non-geometric attributes (Fire Rating, Cost, Manufacturer) based on the object's fidelity.</span>
                     </div>
                   </li>
                 </ul>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-3xl font-bold text-slate-800 mb-1">300</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Design Development</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-3xl font-bold text-slate-800 mb-1">400</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Fabrication</div>
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <ResultsView result={result} onReset={reset} />
        )}
      </main>
    </div>
  );
};

export default App;