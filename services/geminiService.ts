
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectUpdate, Project } from "../types";

export const analyzeTeamData = async (updates: ProjectUpdate[], query: string) => {
  // Initialize inside the function to avoid top-level ReferenceErrors for process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = updates.map(u => 
    `${u.teamMember} (${u.initiative}): ${u.status} complete, Health: ${u.health === 1 ? 'Healthy' : u.health === 0 ? 'Warning' : 'Risk'}. Update: ${u.description}`
  ).join('\n');

  const systemInstruction = `You are PPA (Personal Project Assistant), a senior project analyst. You have access to the following team project data:
  ${dataSummary}
  
  Provide concise, actionable insights. If asked about risks, highlight -1 health scores. If asked about progress, aggregate the percentages.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: { systemInstruction },
  });

  return response.text;
};

// AI-powered task recommendations
export const getProjectSuggestions = async (project: Project): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Based on the project "${project.name}" with description "${project.description}", suggest 5 concrete next steps or tasks as a JSON array of strings.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  });

  try {
    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI suggestions", e);
    return [];
  }
};
