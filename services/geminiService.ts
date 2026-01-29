import { GoogleGenAI } from "@google/genai";

export const getCupidHint = async (context: string, userQuery?: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Cupid, a playful and helpful matchmaking angel. 
      The user is playing a romantic treasure hunt game for Valentine's Day.
      
      Context of current level: ${context}
      
      ${userQuery ? `User asks: ${userQuery}` : 'The user is stuck and needs a hint.'}
      
      Provide a short, fun, and romantic hint. Keep it under 2 sentences. Use emojis.
      Do not give the answer directly if it's a puzzle, just nudge them.`,
    });

    return response.text || "Dragostea e complicată, mai încearcă! (Eroare AI)";
  } catch (error) {
    console.error("Gemini error:", error);
    // Fallback hints in case of error or missing API key
    const hints = [
      "Pe bune, chiar ai nevoie de indiciu? *eyeroll*",
      "E simplu iubire, mai gândește-te puțin! ❤️",
      "Eu sunt doar Cupidon, nu Google! 😉",
      "Răspunsul este în inima ta... și probabil pe ecran.",
      "Hai că poți! Ești cea mai deșteaptă! 🧠",
      "Nu-ți spun! Vreau să văd cum te descurci singură 😛",
      "Încearcă să apeși pe chestii, poate se întâmplă ceva? 🤷‍♂️",
      "Semnalul către Olimp e slab... descurcă-te! 🏹"
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }
};
