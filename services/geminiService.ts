import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCupidHint = async (context: string, userQuery?: string): Promise<string> => {
  try {
    const model = "gemini-3-flash-preview";
    
    const systemPrompt = `
      Ești Cupidon, zeul iubirii. Ești asistentul virtual într-un joc de Treasure Hunt de Valentine's Day.
      Răspunde-i utilizatoarei (iubita creatorului) într-un mod dulce, jucăuș și romantic.
      Trebuie să o ajuți să treacă de nivel, dar NU îi spune răspunsul direct. Dă-i un indiciu subtil.
      Vorbește în limba română. Folosește emoji-uri ❤️.
      Fii scurt și concis (maxim 2 propoziții).
    `;

    const prompt = `Contextul nivelului curent: ${context}. ${userQuery ? `Întrebarea ei: ${userQuery}` : 'Dă-i un indiciu general.'}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Dragostea e un mister... încearcă din nou! ❤️";
  } catch (error) {
    console.error("Cupid is sleeping:", error);
    return "Semnalul către Olimp e slab... urmează-ți inima! ❤️";
  }
};