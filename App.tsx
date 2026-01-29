import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Unlock, Image as ImageIcon, Music, Volume2, VolumeX } from 'lucide-react';

import { GameState, QuizQuestion, SecretCodePart } from './types';
import { QUIZ_QUESTIONS, HIDDEN_DIGITS, SECRET_CODE } from './constants';
import { CupidHelper } from './components/CupidHelper';

// --- Music Player Component ---
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt auto-play with low volume
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log("Autoplay blocked, user interaction required:", err);
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <audio 
        ref={audioRef} 
        loop 
        src="https://upload.wikimedia.org/wikipedia/commons/3/34/Satie_-_Gymnopedie_No_1.ogg" 
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border-2 transition-all duration-300 ${
          isPlaying 
            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' 
            : 'bg-white text-gray-500 border-gray-300'
        }`}
      >
        {isPlaying ? (
          <>
            <Volume2 size={18} className="animate-pulse" />
            <span className="text-sm font-semibold hidden md:inline">Playing</span>
          </>
        ) : (
          <>
            <VolumeX size={18} />
            <span className="text-sm font-semibold hidden md:inline">Music</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

// --- Floating Hearts Background Animation ---
const FloatingHearts = () => {
  // Generate random hearts with different delays and positions
  const hearts = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${10 + Math.random() * 20}s`,
    animationDelay: `${Math.random() * 10}s`,
    size: Math.random() * 20 + 10,
    color: Math.random() > 0.5 ? '#f472b6' : '#c084fc', // pink-400 or purple-400
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart opacity-50"
          style={{
            left: heart.left,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            animationDuration: heart.animationDuration,
            animationDelay: heart.animationDelay,
            color: heart.color,
          }}
        >
          <Heart fill="currentColor" width="100%" height="100%" />
        </div>
      ))}
    </div>
  );
};

// --- Background Component ---
const Background = () => (
  <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
    {/* Animated floating blobs */}
    <motion.div 
      animate={{ x: [0, 100, 0], y: [0, -50, 0] }} 
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-10 left-10 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" 
    />
    <motion.div 
      animate={{ x: [0, -100, 0], y: [0, 100, 0] }} 
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" 
    />
  </div>
);

// --- Welcome Screen ---
const WelcomeScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-pink-300 max-w-lg"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Heart className="w-20 h-20 text-pink-500 mx-auto mb-4" fill="currentColor" />
      </motion.div>
      <h1 className="text-4xl font-bold text-purple-800 mb-4 fancy-font">Salut Iubire! ❤️</h1>
      <p className="text-lg text-gray-700 mb-6">
        Am pregătit o mică aventură pentru tine. Ești gata să rezolvi misterele și să găsești surpriza de la final?
      </p>
      <p className="text-sm text-purple-600 mb-8 italic">
        P.S. Fii atentă la detalii, s-ar putea să găsești un cod secret ascuns pe parcurs...
      </p>
      <button 
        onClick={onStart}
        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold text-xl shadow-lg hover:scale-105 transition-transform"
      >
        Începe Aventura
      </button>
    </motion.div>
  </div>
);

// --- Quiz Level ---
const QuizLevel = ({ onComplete }: { onComplete: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (index: number) => {
    if (index === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(curr => curr + 1);
      } else {
        onComplete();
      }
    } else {
      alert("Mai încearcă o dată! 😉");
    }
  };

  const q = QUIZ_QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <CupidHelper context={q.hintContext} />
      <motion.div
        key={currentQuestion}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border-t-4 border-purple-500"
      >
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Nivelul 1: Quiz</span>
          <span>{currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full p-4 text-left rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-colors font-semibold"
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// --- Search Level (Find Code) ---
const SearchLevel = ({ onComplete }: { onComplete: () => void }) => {
  const [foundDigits, setFoundDigits] = useState<number[]>([]);

  const handleDigitClick = (id: number) => {
    if (!foundDigits.includes(id)) {
      const newFound = [...foundDigits, id];
      setFoundDigits(newFound);
      if (newFound.length === HIDDEN_DIGITS.length) {
        setTimeout(onComplete, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden cursor-crosshair">
      <CupidHelper context="Trebuie să găsești cifrele ascunse pe ecran pentru a completa codul secret. Uită-te după inimioare plutitoare." />
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg border border-pink-300">
          <h2 className="text-pink-600 font-bold mb-1 text-center">Găsește cifrele codului! ({foundDigits.length}/{HIDDEN_DIGITS.length})</h2>
          <div className="flex gap-4 justify-center">
             {HIDDEN_DIGITS.map((part) => (
               <div key={part.id} className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center font-mono text-xl border-2 border-gray-300">
                 {foundDigits.includes(part.id) ? part.digit : '?'}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Decorative items to distract */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`distract-${i}`}
          className="absolute text-pink-300 pointer-events-none select-none"
          initial={{ 
            top: `${Math.random() * 90}%`, 
            left: `${Math.random() * 90}%`,
            scale: 0.5 + Math.random() 
          }}
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
        >
          <Heart fill="currentColor" size={24 + Math.random() * 40} />
        </motion.div>
      ))}

      {/* Hidden Digits */}
      {HIDDEN_DIGITS.map((part) => (
         !foundDigits.includes(part.id) && (
            <motion.button
              key={part.id}
              onClick={() => handleDigitClick(part.id)}
              className="absolute w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-purple-400 text-purple-700 font-bold text-xl hover:scale-110 active:scale-95 z-20"
              style={{ top: part.position.top, left: part.position.left }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <span className="sr-only">Click me</span>
              <Heart className="absolute text-pink-200" size={48} fill="currentColor" />
              <span className="relative z-10">{part.digit}</span>
            </motion.button>
         )
      ))}
      
      {foundDigits.length === HIDDEN_DIGITS.length && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl text-center"
            >
              <h2 className="text-3xl font-bold text-pink-600 mb-2">Bravo!</h2>
              <p className="text-lg">Ai găsit codul: <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{SECRET_CODE}</span></p>
              <p className="text-sm text-gray-500 mt-2">Notează-l, s-ar putea să ai nevoie de el...</p>
            </motion.div>
         </div>
      )}
    </div>
  );
};

// --- Proposal Level ---
const ProposalLevel = ({ onYes }: { onYes: () => void }) => {
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const [hoverCount, setHoverCount] = useState(0);

  const moveNoButton = () => {
    const x = Math.random() * 200 - 100; // -100 to 100
    const y = Math.random() * 200 - 100;
    setNoBtnPosition({ x, y });
    setHoverCount(prev => prev + 1);
  };

  const getNoText = () => {
    if (hoverCount > 2) return "Serios?";
    if (hoverCount > 4) return "Nu mă poți prinde!";
    if (hoverCount > 6) return "Apasă DA!";
    return "Nu";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <CupidHelper context="Acum este momentul cel mare. Nu o lăsa să apese butonul greșit!" />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-lg p-10 rounded-[3rem] shadow-2xl border-4 border-red-300 max-w-2xl"
      >
        <img 
          src="https://picsum.photos/seed/valentine/400/300" 
          alt="Romantic moment" 
          className="rounded-2xl mb-8 mx-auto shadow-md object-cover w-full h-64"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-8 fancy-font leading-tight">
          Vrei să fii Valentinul meu? 🌹
        </h1>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center h-32">
          <button
            onClick={onYes}
            className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-2xl shadow-lg transform transition-transform hover:scale-110 active:scale-95"
          >
            DA! ❤️
          </button>
          
          <motion.button
            animate={noBtnPosition}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseEnter={moveNoButton}
            onClick={moveNoButton}
            className="px-8 py-3 bg-gray-300 text-gray-700 rounded-full font-bold text-lg"
          >
            {getNoText()}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Gallery (Locked) ---
const Gallery = () => {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === SECRET_CODE) {
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setCode("");
    }
  };

  if (unlocked) {
    return (
      <div className="min-h-screen p-6 pt-20">
         <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-purple-800 mb-8 fancy-font">Amintirile Noastre ❤️</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-3 rounded-2xl shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300"
                >
                  <img 
                    src={`https://picsum.photos/seed/${i + 100}/400/300`} 
                    alt="Gallery item" 
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <p className="text-center mt-2 text-gray-600 fancy-font text-xl">Moment {i}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12 p-8 bg-white/50 rounded-3xl">
              <h2 className="text-3xl text-pink-600 font-bold mb-4">Te iubesc!</h2>
              <p className="text-lg text-purple-900">
                Mulțumesc că ai jucat. Acesta este doar începutul poveștii noastre.
              </p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CupidHelper context="Această galerie necesită un cod secret. Codul este format din 4 cifre. Ai găsit cifrele în nivelul cu inimioare plutitoare?" />
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl w-full max-w-md border border-purple-200"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <Lock className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Galerie Secretă</h2>
          <p className="text-center text-gray-500 mt-2">Introdu codul pe care l-ai găsit în timpul vânătorii de comori.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="0000"
            className="w-full text-center text-3xl tracking-[1em] font-mono py-4 border-2 border-purple-200 rounded-xl focus:border-pink-500 focus:outline-none bg-white/50"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            Deblochează
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main App Component ---
const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple state machine for linear progression, but routes allow direct access if needed
  const startGame = () => navigate('/quiz');
  const finishQuiz = () => navigate('/search');
  const finishSearch = () => navigate('/proposal');
  const sayYes = () => {
    // Confetti effect logic could go here
    navigate('/gallery');
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <FloatingHearts />
      <MusicPlayer />
      
      {/* Navigation for Gallery access */}
      {location.pathname !== '/' && location.pathname !== '/gallery' && (
         <button 
           onClick={() => navigate('/gallery')}
           className="fixed top-4 right-4 bg-white/50 backdrop-blur p-2 rounded-full text-purple-600 hover:bg-white transition-colors z-50 border border-purple-200"
           title="Galerie Secretă"
         >
           <ImageIcon size={24} />
         </button>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="w-full">
              <WelcomeScreen onStart={startGame} />
            </motion.div>
          } />
          <Route path="/quiz" element={
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="w-full">
              <QuizLevel onComplete={finishQuiz} />
            </motion.div>
          } />
          <Route path="/search" element={
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="w-full">
              <SearchLevel onComplete={finishSearch} />
            </motion.div>
          } />
          <Route path="/proposal" element={
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="w-full">
              <ProposalLevel onYes={sayYes} />
            </motion.div>
          } />
          <Route path="/gallery" element={
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="w-full">
              <Gallery />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}