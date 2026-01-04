import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an expert Senior BIM Manager and VDC Coordinator. 
Your task is to analyze screenshots or renders of 3D Building Information Models (BIM) elements and determine their compliance with specific Level of Development (LOD) standards (LOD 300, 400, 500).

**LOD Definitions Context:**
- **LOD 300 (Precise Geometry):** The element is graphically represented as a specific system, object, or assembly in terms of quantity, size, shape, location, and orientation. Specific geometry is defined (e.g., exact dimensions of a beam), but fabrication details (bolts, welds) might be missing.
- **LOD 400 (Fabrication):** The element is modeled with sufficient detail for fabrication and assembly. This includes distinct graphical representation of bolts, welds, connections, reinforcement, and detailed fittings.
- **LOD 500 (As-Built):** Field verified representation. Visually similar to LOD 400 but implies the presence of verified "as-installed" data (Manufacturer, Model, Serial Numbers, Installation Dates).

**Analysis Rules:**
1. **Geometry:** specific shape, dimensions, connections, bolts, threads, clearances.
2. **Parameters:** infer based on visual complexity if the object *looks* like it carries heavy metadata (e.g., a simple box implies low parameters; a detailed pump implies high parameters).
3. **Information Level:** overall completeness for the construction/operations phase requested.

Output the result in strict JSON format.
`;

export async function analyzeLODCompliance(
  base64Image: string,
  lodTarget: string,
  elementType: string,
  additionalContext?: string
): Promise<AnalysisResult> {
  
  const prompt = `
  Analyze this BIM element image. 
  Element Type: ${elementType || "Unknown/Auto-detect"}.
  Target LOD: ${lodTarget}.
  Additional Context: ${additionalContext || "None"}.

  Evaluate compliance against ${lodTarget}.
  
  Provide a detailed critique on:
  1. Geometry (Is it detailed enough for ${lodTarget}? Too simple? Too detailed?)
  2. Parameters (Based on visual fidelity, what data appears to be missing for ${lodTarget}?)
  3. Information Level (Is this suitable for the target phase: Coordination, Fabrication, or Operations?)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG/JPEG, API handles common formats
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "0 to 100 compliance score" },
            lodTarget: { type: Type.STRING },
            elementName: { type: Type.STRING, description: "Identified element name" },
            summary: { type: Type.STRING, description: "Executive summary of the check in English (with Arabic translation in parentheses if useful)" },
            geometry: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ["Compliant", "Partial", "Non-Compliant"] },
                observations: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["score", "status", "observations", "missing", "recommendations"]
            },
            parameters: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ["Compliant", "Partial", "Non-Compliant"] },
                observations: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["score", "status", "observations", "missing", "recommendations"]
            },
            information: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ["Compliant", "Partial", "Non-Compliant"] },
                observations: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["score", "status", "observations", "missing", "recommendations"]
            }
          },
          required: ["overallScore", "lodTarget", "elementName", "summary", "geometry", "parameters", "information"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("LOD Analysis Failed:", error);
    throw error;
  }
}