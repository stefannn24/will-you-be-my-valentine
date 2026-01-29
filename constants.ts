import { QuizQuestion, SecretCodePart } from './types';

export const SECRET_CODE = "2025";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Unde am avut prima noastră întâlnire?",
    options: ["În parc", "La o cafenea", "La cinema", "Pe lună"],
    correctAnswer: 1,
    hintContext: "Prima întâlnire a fost într-un loc cu cafea."
  },
  {
    id: 2,
    question: "Care este culoarea mea preferată (pe care o port des)?",
    options: ["Verde", "Albastru", "Mov", "Negru"],
    correctAnswer: 2,
    hintContext: "Este culoarea regilor și a lavandei."
  },
  {
    id: 3,
    question: "Ce îmi place să mănânc cel mai mult?",
    options: ["Pizza", "Sushi", "Paste", "Burger"],
    correctAnswer: 0,
    hintContext: "Este rotundă, italiană și delicioasă."
  }
];

// Random positions for the hidden code digits
export const HIDDEN_DIGITS: SecretCodePart[] = [
  { id: 1, digit: '2', found: false, position: { top: '15%', left: '10%' } },
  { id: 2, digit: '0', found: false, position: { top: '75%', left: '80%' } },
  { id: 3, digit: '2', found: false, position: { top: '40%', left: '50%' } },
  { id: 4, digit: '5', found: false, position: { top: '85%', left: '15%' } },
];