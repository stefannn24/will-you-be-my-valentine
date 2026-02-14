import { QuizQuestion, SecretCodePart } from './types';

export const SECRET_CODE = "1097";

export const MUSIC_PLAYLIST = [
  {
    title: "Cosmos - Irina Rimes",
    src: "/cosmos.mp3"
  },
  {
    title: "La Nesfarsit - The Motans",
    src: "/nesfarsit.mp3"
  },
  {
    title: "Would you fall in love - Anna Lea",
    src: "/iwouldfallinlove.mp3"
  },
  {
    title: "Iris - Goo Goo Dolls",
    src: "/iris.mp3"
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Unde am avut primul date?",
    options: ["În parc", "La o cafenea", "La cinema", "Pe lună"],
    correctAnswer: 2,
    hintContext: "Prima întâlnire a fost într-un loc cu cafea."
  },
  {
    id: 2,
    question: "Care este culoarea mea preferată (a noastra de fapt🌚)?",
    options: ["Verde", "Albastru", "Mov", "Negru"],
    correctAnswer: 2,
    hintContext: "Este culoarea regilor și a lavandei."
  },
  {
    id: 3,
    question: "Ce îmi place să mănânc cel mai mult?",
    options: ["Pizza", "Sushi", "Paste", "Pe tine"],
    correctAnswer: 3,
    hintContext: "Este rotundă, italiană și delicioasă."
  },
  {
    id: 4,
    question: "Care este filmul nostru preferat?",
    options: ["The Notebook", "Titanic", "Purple Hearts", "Me Before You"],
    correctAnswer: [0, 1, 2, 3],
    hintContext: "Are un căpcăun verde."
  },
  {
    id: 5,
    question: "Cine a spus 'Te iubesc' primul?",
    options: ["Eu(Stef)", "Eu(Ari)", "Stef", "Stefi"],
    correctAnswer: [0, 2, 3],
    hintContext: "Eu am fost mai curajos/curajoasă."
  },
  {
    id: 6,
    question: "Care este anotimpul meu preferat?",
    options: ["Primăvara", "Vara", "Toamna", "Toate atat timp cat sunt cu tine"],
    correctAnswer: 3,
    hintContext: "Îmi plac frunzele ruginii și dovlecii."
  },
  {
    id: 7,
    question: "Unde am făcut prima noastră poză împreună?",
    options: ["Pe bancă în parc", "La magazin", "La cinema", "În mașină"],
    correctAnswer: 0,
    hintContext: "Eram prinși în trafic, dar fericiți."
  },
  {
    id: 8,
    question: "Ce îmi doresc să vizităm cel mai mult?",
    options: ["Paris", "Tokyo", "New York", "Patul tau"],
    correctAnswer: 3,
    hintContext: "Țara soarelui răsare și a sushi-ului."
  },
  {
    id: 9,
    question: "Cum mă alinti cel mai des?",
    options: ["Iubire", "Pui", "Stef", "Coaie"],
    correctAnswer: [0, 1, 2, 3],
    hintContext: "Suna a ceva ce face explozie de dragoste."
  },
  {
    id: 10,
    question: "Câți ani împlinim împreună? (întrebare capcană)",
    options: ["1 an", "2 ani", "3 ani", " X̿I̿I̿I̿D̿C̿C̿C̿."],
    correctAnswer: 3,
    hintContext: "Este un număr magic."
  }
];

// Random positions for the hidden code digits
export const HIDDEN_DIGITS: SecretCodePart[] = [
  { id: 1, digit: '1', found: false, position: { top: '15%', left: '10%' } },
  { id: 2, digit: '0', found: false, position: { top: '75%', left: '80%' } },
  { id: 3, digit: '9', found: false, position: { top: '40%', left: '50%' } },
  { id: 4, digit: '7', found: false, position: { top: '85%', left: '15%' } },
];