export enum LODLevel {
  LOD300 = 'LOD 300',
  LOD400 = 'LOD 400',
  LOD500 = 'LOD 500'
}

export interface AnalysisSection {
  score: number; // 0-100
  status: 'Compliant' | 'Partial' | 'Non-Compliant';
  observations: string[];
  missing: string[];
  recommendations: string[];
}

export interface AnalysisResult {
  overallScore: number;
  lodTarget: string;
  elementName: string;
  summary: string;
  geometry: AnalysisSection;
  parameters: AnalysisSection;
  information: AnalysisSection;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: AnalysisResult;
}