
export const getCupidHint = async (context: string, userQuery?: string): Promise<string> => {
  // Simulate network delay for "thinking" effect
  await new Promise(resolve => setTimeout(resolve, 800));

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
};
