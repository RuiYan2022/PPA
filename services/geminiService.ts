
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectUpdate, Project } from "../types";

// Helper to safely get the AI instance
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const isAIReady = () => !!process.env.API_KEY;

export const analyzeTeamData = async (updates: ProjectUpdate[], query: string) => {
  const ai = getAIInstance();
  if (!ai) throw new Error("API_KEY_MISSING");
  
  const dataSummary = updates.map(u => 
    `${u.teamMember} (${u.initiative}): ${u.status} complete, Health: ${u.health === 1 ? 'Healthy' : u.health === 0 ? 'Warning' : 'Risk'}. Update: ${u.description}`
  ).join('\n');

  const systemInstruction = `You are PPA (Personal Project Assistant), a senior project analyst. 
  Current Team Data:
  ${dataSummary}
  
  Guidelines:
  - Be concise and professional.
  - Highlight -1 health scores as "CRITICAL RISKS".
  - Aggregate progress percentages when asked about general status.
  - Suggest specific team members to follow up with.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: { systemInstruction },
  });

  return response.text;
};

export const getProjectSuggestions = async (project: Project): Promise<string[]> => {
  const ai = getAIInstance();
  if (!ai) throw new Error("API_KEY_MISSING");
  
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
