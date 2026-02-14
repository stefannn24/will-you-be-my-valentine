
const CUPID_HINTS = [
  "Pe bune, chiar ai nevoie de indiciu? *eyeroll* 🙄",
  "E simplu iubirel, mai gândește-te puțin! ❤️",
  "Eu sunt doar Cupidon, nu Google! 😉",
  "Răspunsul este în inima ta... și probabil pe ecran. 📱",
  "Hai că poți! Ești cea mai deșteaptă! 🧠",
  "Nu-ți spun! Vreau să văd cum te descurci singură 😛",
  "Încearcă să apeși pe chestii, poate se întâmplă ceva? 🤷‍♂️",
  "Semnalul către Olimp e slab... descurcă-te! 🏹",
  "Sunt în pauză de masă. Revino în 5 minute. 🍔",
  "Ești atât de aproape! (Cred) 🤏",
  "Folosește intuiția feminină! Funcționează mereu. ✨",
  "Error 404: Indiciu not found. Te descurci tu! 🤖",
  "Un mic pas pentru tine, un mare pas pentru... noi doi? 🚀",
  "Dacă greșești, nu-i nimic. Te iubesc oricum! (Dar încearcă să nu) 😂",
  "Pssst... răspunsul e varianta corectă. You're welcome. 🤫",
  "Nu pot să te ajut, sunt ocupat să țintesc inimi. 💘",
  "Ai încercat să închizi și să deschizi ochii? Poate ajută. 😆",
  "Sunt un AI romantic, nu o enciclopedie! 📚",
  "Dacă ghicești, primești un pupic! 😘",
  "Serios? Chiar vrei indiciu la asta? Ești haioasă! 😂"
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// State to track used hints ensuring no repeats until all are used
let availableIndices: number[] = [];

const getNextHint = (): string => {
  if (availableIndices.length === 0) {
    // Initialize the bag with all indices
    availableIndices = Array.from({ length: CUPID_HINTS.length }, (_, i) => i);
    // Shuffle the bag
    shuffleArray(availableIndices);
  }
  
  // Pop the next unique index
  const index = availableIndices.pop();
  // Fallback to 0 if something goes wrong (shouldn't happen)
  return CUPID_HINTS[index ?? 0];
};

export const getCupidHint = async (context: string, userQuery?: string): Promise<string> => {
  // Simulate network delay for "thinking" effect
  await new Promise(resolve => setTimeout(resolve, 600));

  return getNextHint();
};
