export enum GameState {
  WELCOME = 'WELCOME',
  QUIZ = 'QUIZ',
  SEARCH = 'SEARCH',
  PROPOSAL = 'PROPOSAL',
  GALLERY_LOCKED = 'GALLERY_LOCKED',
  GALLERY_OPEN = 'GALLERY_OPEN'
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  hintContext: string; // Context for Gemini
}

export interface SecretCodePart {
  id: number;
  digit: string;
  found: boolean;
  position: { top: string; left: string };
}

export type CupidMood = 'happy' | 'thinking' | 'excited';