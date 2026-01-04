import React from 'react';
import { AnalysisResult, AnalysisSection } from '../types';
import ScoreGauge from './ScoreGauge';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const DetailCard: React.FC<{ title: string; data: AnalysisSection; icon: React.ReactNode }> = ({ title, data, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${data.status === 'Compliant' ? 'bg-green-100 text-green-600' : data.status === 'Non-Compliant' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
            {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            data.status === 'Compliant' ? 'bg-green-100 text-green-700' : 
            data.status === 'Non-Compliant' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            {data.status.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-slate-700">{data.score}</span>
        <span className="text-xs text-slate-400 block">/ 100</span>
      </div>
    </div>

    <div className="space-y-4">
      {data.observations.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observations</h4>
          <ul className="space-y-1">
            {data.observations.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start">
                <span className="mr-2 text-blue-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.missing.length > 0 && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Missing Elements</h4>
          <ul className="space-y-1">
            {data.missing.map((item, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start">
                <span className="mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommendations.length > 0 && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Action Items</h4>
          <ul className="space-y-1">
            {data.recommendations.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start">
                <svg className="w-4 h-4 text-slate-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                {result.lodTarget}
              </span>
              <h2 className="text-2xl font-bold">{result.elementName}</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              {result.summary}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[150px]">
            <ScoreGauge score={result.overallScore} />
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard 
          title="Geometry" 
          data={result.geometry} 
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <DetailCard 
          title="Parameters" 
          data={result.parameters} 
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <DetailCard 
          title="Information Level" 
          data={result.information} 
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={onReset}
          className="px-6 py-2.5 bg-white border border-slate-300 shadow-sm text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Analyze Another Model
        </button>
      </div>
    </div>
  );
};

export default ResultsView;