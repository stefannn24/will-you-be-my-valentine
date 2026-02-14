import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Unlock, Image as ImageIcon, Music, Volume2, VolumeX, Cat, Dog, Bird, Ghost, Star, Frown, SkipBack, SkipForward, Play, Pause, Disc, ChevronDown, ChevronUp, X, Ticket, Sparkles as SparkleIcon } from 'lucide-react';

import { GameState, QuizQuestion, SecretCodePart } from './types';
import { QUIZ_QUESTIONS, HIDDEN_DIGITS, SECRET_CODE, MUSIC_PLAYLIST } from './constants';
import { CupidHelper } from './components/CupidHelper';

const text1 = "Ți-am pregătit un mini joculeț :>";
const text2 = "P.S. Sa retii codul, poate semnifica ceva...";

const letterDuration = 0.05; // Viteza de scriere (secunde per literă)
const firstTextDuration = text1.length * letterDuration; // Cât durează primul text

// --- CONFIGURATION: IMAGES FROM PUBLIC FOLDER ---
// Ensure pic1.jpg, pic2.jpg... are in your public folder
const GALLERY_IMAGES = [
  "/pic7.jpg",
  "/pic2.jpg",
  "/pic3.jpg",
  "/pic4.jpg",
  "/pic5.jpg",
  "/pic6.jpg",
];

// Ensure proposal.jpg is in your public folder
const PROPOSAL_IMAGE = "/pic1.jpg";


// --- Global Click Sparkles Component ---
const ClickSparkles = () => {
  const [sparkles, setSparkles] = useState<{id: number, x: number, y: number, color: string}[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const colors = ['#ec4899', '#a855f7', '#fbbf24', '#3b82f6'];
      const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      
      setSparkles(prev => [...prev, ...newSparkles]);
      
      // Cleanup
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id < Date.now()));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <AnimatePresence>
        {sparkles.map(s => (
          <motion.div
            key={s.id}
            initial={{ scale: 0, x: s.x, y: s.y, opacity: 1 }}
            animate={{ 
              scale: [0, 1, 0], 
              x: s.x + (Math.random() - 0.5) * 100, 
              y: s.y + (Math.random() - 0.5) * 100,
              opacity: 0
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ color: s.color }}
            className="absolute"
          >
            {Math.random() > 0.5 ? <Heart size={12} fill="currentColor" /> : <Star size={10} fill="currentColor" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Mini Player Component ---
// --- Mini Player Component (Fixed for Autoplay) ---
const MiniPlayer = ({ startMusic }: { startMusic: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const MAX_VOLUME = 0.4; // Volum maxim (40%)

  // Funcție sigură de Fade In
  const fadeIn = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Oprim orice fade anterior
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audio.volume = 0; // Start de la 0
    let vol = 0;
    
    fadeIntervalRef.current = window.setInterval(() => {
      if (!audio) return;
      // Creștem volumul
      vol = Math.min(vol + 0.02, MAX_VOLUME); 
      audio.volume = vol;

      // Stop când ajungem la maxim
      if (vol >= MAX_VOLUME) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, 50);
  };

  const changeTrack = (direction: 'next' | 'prev' | 'auto') => {
    const newIndex = direction === 'next' || direction === 'auto'
      ? (currentTrackIndex + 1) % MUSIC_PLAYLIST.length
      : (currentTrackIndex - 1 + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;

    setCurrentTrackIndex(newIndex);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Când dăm play manual, resetăm volumul direct la maxim sau facem fade
      audioRef.current.volume = MAX_VOLUME; 
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Play error:", e));
      }
      setIsPlaying(true);
    }
  };

  // Gestionare progress bar + fade out la final
  const handleTimeUpdate = () => {
     const audio = audioRef.current;
     if (!audio) return;

     if (audio.duration) {
         setProgress((audio.currentTime / audio.duration) * 100);
     }
     
     if (!isPlaying) return;

     // Auto fade out în ultimele 4 secunde
     const timeLeft = audio.duration - audio.currentTime;
     if (timeLeft <= 4 && timeLeft > 0) {
        const targetVol = (timeLeft / 4) * MAX_VOLUME;
        if (audio.volume > targetVol) {
            audio.volume = Math.max(0, targetVol);
        }
     }
  };

  // Când se schimbă piesa, o încărcăm și îi dăm play dacă playerul e activ
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = MUSIC_PLAYLIST[currentTrackIndex]?.src || "";
      audioRef.current.load(); // Important pentru unele browsere
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
           playPromise
             .then(() => {
                // Resetăm volumul la maxim pentru piesa nouă (sau facem fade in rapid)
                if (audioRef.current) audioRef.current.volume = MAX_VOLUME;
             })
             .catch(e => console.error("Playback failed on track change", e));
        }
      }
    }
  }, [currentTrackIndex]);

  // AICI ESTE FIX-UL PENTRU AUTOPLAY
  // Ascultăm variabila `startMusic` care vine din App
  useEffect(() => {
    if (startMusic && audioRef.current && !isPlaying) {
      // Încercăm să pornim muzica
      audioRef.current.volume = 0; // Pregătim fade-in
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
             setIsPlaying(true);
             fadeIn(); // Doar dacă play a reușit, facem fade in
          })
          .catch((error) => {
             // Dacă browserul blochează autoplay, setăm play pe false
             // și lăsăm utilizatorul să apese manual pe buton
             console.log("Autoplay blocked by browser (waiting for interaction):", error);
             setIsPlaying(false);
             if (audioRef.current) audioRef.current.volume = MAX_VOLUME; // Resetăm volumul pt click manual
          });
      }
    }
  }, [startMusic]);

  if (!MUSIC_PLAYLIST || MUSIC_PLAYLIST.length === 0) return null;

  const currentTrack = MUSIC_PLAYLIST[currentTrackIndex];

  return (
    <div className="fixed bottom-2 left-2 right-2 z-50 md:bottom-4 md:left-4 md:right-auto md:w-auto">
      <audio 
        ref={audioRef} 
        onEnded={() => changeTrack('auto')}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
      />
      
      <AnimatePresence mode="wait">
        {!isExpanded ? (
            <motion.button
                key="collapsed"
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 45, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(true)}
                className="bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-full shadow-2xl border-2 border-purple-300 text-purple-600 hover:bg-purple-50 flex items-center justify-center relative overflow-hidden group mx-auto md:mx-0"
            >
                <Music size={24} className="relative z-10" />
                {isPlaying && (
                    <>
                        <motion.span 
                            className="absolute inset-0 bg-pink-200 opacity-30 rounded-full"
                            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </>
                )}
            </motion.button>
        ) : (
            <motion.div 
              key="expanded"
              initial={{ width: 60, height: 60, opacity: 0, y: 20 }}
              animate={{ width: '100%', height: 'auto', opacity: 1, y: 0 }}
              exit={{ width: 60, height: 60, opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/80 backdrop-blur-xl border border-white/50 p-2 md:p-3 rounded-2xl shadow-2xl flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-hidden relative"
              style={{ maxWidth: '100%' }}
            >
                {/* ... (restul UI-ului rămâne la fel) ... */}
                {/* Voi simplifica aici doar pentru a arăta structura, păstrează UI-ul tău detaliat */}
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-100">
                    <motion.div className="h-full bg-gradient-to-r from-pink-400 to-purple-500" style={{ width: `${progress}%` }} layout />
                </div>

                <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg border-2 border-white">
                    <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                        <Disc className="text-white/80" size={20} />
                    </motion.div>
                </div>

                <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
                      <div className="w-full overflow-hidden relative h-5">
                          <motion.div className="whitespace-nowrap text-xs md:text-sm font-bold text-gray-800" animate={{ x: [0, -50] }} transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}>
                             {currentTrack.title}
                          </motion.div>
                      </div>
                      <span className="text-[10px] md:text-xs text-purple-500 font-medium truncate">Playing for you ❤️</span>
                </div>

                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 z-10">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => changeTrack('prev')} className="p-1.5 text-purple-400 hover:text-purple-600">
                        <SkipBack size={16} fill="currentColor" />
                    </motion.button>
                    
                    <motion.button whileTap={{ scale: 0.85 }} onClick={togglePlay} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shadow-lg transition-all" animate={{ backgroundColor: isPlaying ? '#9333ea' : '#f3e8ff', color: isPlaying ? '#ffffff' : '#9333ea' }}>
                         {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => changeTrack('next')} className="p-1.5 text-purple-400 hover:text-purple-600">
                        <SkipForward size={16} fill="currentColor" />
                    </motion.button>
                    
                    <div className="w-px h-5 bg-purple-200 mx-0.5 md:mx-1"></div>
                    
                    <motion.button whileHover={{ scale: 1.1, rotate: 180 }} onClick={() => setIsExpanded(false)} className="p-1 text-gray-400 hover:text-purple-600">
                        <ChevronDown size={18} />
                    </motion.button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Gallery Item Component with Effect ---
// Updated to accept imageSrc prop for public folder images
const GalleryItem: React.FC<{ i: number, imageSrc: string }> = ({ i, imageSrc }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      className="bg-white p-3 rounded-2xl shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300"
    >
      {/* Am schimbat bg-gray-100 cu bg-black/5 pentru un fundal mai subtil în spatele pozelor */}
      <div className="w-full h-64 overflow-hidden rounded-xl bg-black/5 relative flex items-center justify-center">
        <motion.img 
          src={imageSrc} 
          alt={`Moment ${i}`}
          onLoad={() => setIsLoaded(true)}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: isLoaded ? 1 : 1.1, 
            opacity: isLoaded ? 1 : 0 
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          // --- MODIFICAREA PRINCIPALĂ AICI ---
          // 'object-contain' = Arată toată poza, nu o taie
          className="w-full h-full object-contain"
        />
        {!isLoaded && (
           <div className="absolute inset-0 flex items-center justify-center">
             <Heart className="text-pink-200 animate-pulse" />
           </div>
        )}
      </div>
      <p className="text-center mt-2 text-gray-600 fancy-font text-xl">Moment {i + 1}</p>
    </motion.div>
  );
};

// --- Date Night Jar Component ---
const DateNightJar = () => {
  const [ticket, setTicket] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const coupons = [
    "Masaj de relaxare (meriti ca esti regina regeasca)💆‍♀️",
    "Cină gătită de mine (un sendvisel, doua la domnisoara)🍝",
    "Seară de film la alegerea ta (oricum tu alegi 🙄) 🎬",
    "Mic dejun la pat (eu sunt micul dejun duh)🥐",
    "Excursie de weekend surpriză (eu la tine in pat si tu pe mine) 🚗",
    "Desertul tău preferat, oricând (eu sunt ala) 🍰"
  ];

  const handleShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    setTicket(null);
    
    setTimeout(() => {
      const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)];
      setTicket(randomCoupon);
      setIsShaking(false);
    }, 1000);
  };

  return (
    <div className="mt-16 mb-12 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-purple-800 mb-6 fancy-font text-center">Borcanul cu Dorințe ✨</h2>
      <div className="relative group">
          <motion.div
            animate={isShaking ? { rotate: [-5, 5, -5, 5, 0], x: [-2, 2, -2, 2, 0] } : {}}
            transition={{ duration: 0.5, repeat: isShaking ? Infinity : 0 }}
            onClick={handleShake}
            className="cursor-pointer relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-40 h-52 bg-white/40 backdrop-blur-sm border-4 border-white rounded-[2rem] shadow-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-100/50"></div>
                {/* Visual Papers inside */}
                <div className="absolute bottom-4 left-4 w-12 h-8 bg-yellow-200 rounded shadow-sm rotate-12 opacity-80" />
                <div className="absolute bottom-6 right-6 w-12 h-8 bg-blue-200 rounded shadow-sm -rotate-6 opacity-80" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-8 bg-green-200 rounded shadow-sm rotate-2 opacity-80" />
                
                <div className="text-center p-2 z-20">
                   <SparkleIcon className="mx-auto text-yellow-400 mb-2" size={32} />
                   <span className="text-purple-600 font-bold text-sm bg-white/80 px-2 py-1 rounded-full">Apasă-mă!</span>
                </div>
            </div>
            {/* Lid */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-44 h-8 bg-purple-300 rounded-lg shadow-md border-b-4 border-purple-400" />
          </motion.div>

          {/* Popped Ticket */}
          <AnimatePresence>
             {ticket && (
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ y: -20, opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 min-w-[250px]"
                >
                  <div className="bg-yellow-100 border-2 border-yellow-300 p-6 rounded-lg shadow-2xl transform rotate-2 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-full border border-gray-300" />
                      <div className="flex flex-col items-center text-center">
                         <Ticket className="text-yellow-600 mb-2" />
                         <h3 className="font-bold text-yellow-800 uppercase tracking-wider text-xs mb-1">Cupon Valabil</h3>
                         <p className="text-lg font-bold text-gray-800 fancy-font">{ticket}</p>
                         <p className="text-[10px] text-gray-500 mt-2">Valabil oricând dorești ❤️</p>
                      </div>
                  </div>
                </motion.div>
             )}
          </AnimatePresence>
      </div>
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

// --- Interactive Background Characters ---
const BackgroundCharacters = () => {
  const characters = [
    { id: 1, Icon: Cat, color: 'text-orange-400', initialX: 10, initialY: 20 },
    { id: 2, Icon: Bird, color: 'text-blue-400', initialX: 80, initialY: 15 },
    { id: 3, Icon: Dog, color: 'text-brown-400', initialX: 20, initialY: 80 },
    { id: 4, Icon: Ghost, color: 'text-purple-400', initialX: 85, initialY: 70 },
    { id: 5, Icon: Star, color: 'text-yellow-400', initialX: 50, initialY: 50 },
  ];

  return (
    <div className="fixed inset-0 -z-4 pointer-events-none overflow-hidden">
      {characters.map((char) => (
        <InteractiveCharacter key={char.id} {...char} />
      ))}
    </div>
  );
};

const InteractiveCharacter = ({ Icon, color, initialX, initialY }: any) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  
  // Random wandering movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => ({
        x: Math.min(Math.max(prev.x + (Math.random() - 0.5) * 10, 5), 95),
        y: Math.min(Math.max(prev.y + (Math.random() - 0.5) * 10, 5), 95),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`absolute ${color} cursor-pointer pointer-events-auto opacity-60 hover:opacity-100`}
      animate={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        y: [0, -10, 0]
      }}
      transition={{ 
        left: { duration: 3, ease: "easeInOut" },
        top: { duration: 3, ease: "easeInOut" },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.5, rotate: [0, -20, 20, 0] }}
      whileTap={{ scale: 0.8, rotate: 360 }}
    >
      <Icon size={32} fill="currentColor" className="opacity-50" />
    </motion.div>
  );
};

// --- Love Letter Component ---
const LoveLetter = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center mt-12 mb-20 relative z-10">
      <div className="relative w-72 h-48 md:w-80 md:h-56 cursor-pointer group perspective-1000" onClick={() => setIsOpen(true)}>
          
          {/* Animated Hint if not open */}
          {!isOpen && (
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute -top-12 left-0 right-0 text-center text-purple-600 font-bold text-sm bg-white/50 backdrop-blur px-2 py-1 rounded-full w-max mx-auto shadow-sm"
            >
               Apasă pentru a deschide 💌
            </motion.div>
          )}

          {/* Envelope Back */}
          <div className="absolute inset-0 bg-pink-100 rounded-b-xl shadow-2xl border border-pink-200" />

          {/* Letter Paper (Inside) */}
          {/* We animate this sliding up slightly before full open */}
          <motion.div
            className="absolute left-4 right-4 top-2 bottom-2 bg-white rounded shadow-sm"
            initial={{ y: 0 }}
            animate={isOpen ? { y: -80, transition: { delay: 0.2, duration: 0.5 } } : {}}
          />

          {/* Envelope Flap (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-pink-200 rounded-b-xl z-10" 
              style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
          />
          {/* Envelope Flaps (Sides) */}
          <div className="absolute inset-0 z-10">
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-pink-50 rounded-bl-xl" 
                 style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-pink-50 rounded-br-xl" 
                 style={{ clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }} />
          </div>

          {/* Top Flap (The one that opens) */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1/2 bg-pink-100 z-20 origin-top shadow-md"
            style={{ 
               clipPath: "polygon(0 0, 100% 0, 50% 100%)",
               borderRadius: "0.75rem 0.75rem 0 0" 
            }}
            initial={{ rotateX: 0 }}
            animate={isOpen ? { rotateX: 180, zIndex: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Wax Seal & Ribbon (Only visible when closed) */}
            <motion.div 
               className="absolute top-[40%] left-1/2 -translate-x-1/2 flex flex-col items-center"
               animate={{ opacity: isOpen ? 0 : 1 }}
            >
               {/* Ribbon Vertical */}
               <div className="w-8 h-12 bg-red-500/20 absolute -top-4 rounded-sm" />
               {/* Wax Seal */}
               <div className="w-10 h-10 bg-red-600 rounded-full border-2 border-red-700 shadow-inner flex items-center justify-center relative z-10">
                  <Heart size={16} className="text-red-200" fill="currentColor" />
               </div>
            </motion.div>
          </motion.div>
      </div>

      {/* Expanded Letter Modal */}
      <AnimatePresence>
        {isOpen && (
           <motion.div 
             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={(e) => {
                 if (e.target === e.currentTarget) setIsOpen(false);
             }}
           >
             <motion.div 
                className="bg-[#fffdf7] p-8 md:p-12 max-w-2xl w-full rounded-sm shadow-2xl relative overflow-y-auto max-h-[90vh]"
                style={{ 
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
                  fontFamily: "'Pacifico', cursive" 
                }}
                initial={{ scale: 0.5, y: 100, rotate: 5 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.5, y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
             >
                 {/* Close Button */}
                 <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                 >
                    <X size={24} />
                 </button>

                 {/* Letter Content */}
                 <div className="text-gray-800 space-y-6 text-lg md:text-xl leading-relaxed">
                     <h2 className="text-3xl text-red-600 mb-6 font-bold text-center">Bibita mea,</h2>
                     
                     <p>
                      14 februarie 2023. E ziua in care povestea noastra frumoasa a inceput (de fapt cu mult timp inainte dar nu stii tu🙄). E ziua in care mi-am gasit sufletul pereche, in care m-am lasat prada iubirii si m-am aruncat in bratele tale muschiuloase.
                       </p>
                       <p> Esti sufletul meu, esti inimioara si dragostea mea, te ador de la mantaua superioara si pana la crusta continentala, te iubesc cu tot hipotalamusul meu. Esti constanta mea intr-un program plin de variabile, esti CSS-ul vietii mele (adica fara tine as fi ca un text d ala boring) si esti mai pretioasa decat toate diamantele din lume, regina mea.</p>
                      <p>Uitandu-ma acum la tine cum dormi, stiu ca nu mi-as dori nimic altceva decat sa fiu aici, cu tine. In fiecare luna, in fiecare secunda, in fiecare moment in care respir. Esti tot ce mi-am dorit vreodata de la univers, tot ce am mai scump pe lume si tot ceea ce ma face fericit. Ti-am mai zis asta, dar faptul ca te-am intalnit pe tine este cel mai bun lucru care mi s-a intamplat vreodata. Singurul lucru pe care mi-l doresc mai mult decat sa te am langa mine acum, in acest moment, este sa te pot avea pentru tot restul zilelor mele, sa te pot iubi si sa ma iubesti in continuare.</p>
                      <p>Te iubesc mai mult decat voi putea vreodata exprima in cuvinte.</p>

                     <div className="mt-12 text-right">
                         <p className="text-2xl">Cu toată dragostea,</p>
                         <p className="text-3xl text-red-600 mt-2">Valentinul tău ❤️</p>
                     </div>
                 </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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
      <h1 className="text-4xl font-bold text-purple-800 mb-4 fancy-font">Buna iubirel ❤️</h1>
      <p className="text-lg text-gray-700 mb-6 font-mono">
  {text1.split("").map((char, index) => (
    <motion.span
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.05, delay: index * 0.05 }}
    >
      {char}
    </motion.span>
  ))}
</p>
      {/* Al doilea Paragraf (P.S.) */}
<p className="text-sm text-purple-600 mb-8 italic font-mono">
  {text2.split("").map((char, index) => (
    <motion.span
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.05,
        // Aici e magia: Așteptăm să se termine primul text + indexul curent + 0.5s pauză
        delay: firstTextDuration + (index * letterDuration) + 0.5 
      }}
    >
      {char}
    </motion.span>
  ))}
</p>
      <button 
        onClick={onStart}
        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold text-xl shadow-lg hover:scale-105 transition-transform"
      >
        Atinge-ma😛
      </button>
    </motion.div>
  </div>
);

// --- Quiz Level ---
const QuizLevel = ({ onComplete }: { onComplete: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isError, setIsError] = useState(false);

  const handleAnswer = (index: number) => {
    // 1. Get correct answer(s) from current question
    const currentQ = QUIZ_QUESTIONS[currentQuestion];
    const correct = currentQ.correctAnswer;

    // 2. Check if answer matches (supports single value or array of values)
    const isCorrect = Array.isArray(correct) 
      ? correct.includes(index)  
      : correct === index;       

    // 3. Logic based on result
    if (isCorrect) {
      setIsError(false);
      // Small visual delay before transition
      setTimeout(() => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
          setCurrentQuestion(curr => curr + 1);
        } else {
          onComplete();
        }
      }, 200);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 800);
    }
  };

  const q = QUIZ_QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <CupidHelper context={q.hintContext} />
      
      {/* Aesthetic Error Notification - Floating gently */}
      <AnimatePresence>
        {isError && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-24 z-50 bg-red-100 text-red-500 px-6 py-3 rounded-full shadow-lg border-2 border-red-200 font-bold flex items-center gap-2"
          >
            <Ghost size={20} />
            <span>Ups! Mai încearcă, iubire! 🙈</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={currentQuestion}
        initial={{ x: 300, opacity: 0 }}
        animate={{ 
          x: isError ? [-10, 10, -10, 10, 0] : 0,
          opacity: 1 // IMPORTANT: Keep opacity 1 during error animation
        }}
        transition={{ 
          x: isError ? { type: 'tween', duration: 0.4 } : { type: "spring", stiffness: 260, damping: 20 },
          opacity: { duration: 0.5 }
        }}
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
              className="w-full p-4 text-left rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-all font-semibold hover:shadow-md active:scale-95 duration-200"
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// --- Search Level Components ---

interface FloatingItemProps {
  id: number;
  type: 'digit' | 'decoy';
  content?: string;
  onFound: (id: number) => void;
  found: boolean;
}

const FloatingItem: React.FC<FloatingItemProps> = ({ id, type, content, onFound, found }) => {
  const [isPopped, setIsPopped] = useState(false);
  
  // Random starting position and movement parameters
  const { startX, startY } = useMemo(() => {
    let x, y;
    let attempts = 0;
    let valid = false;
    
    // Attempt to find a valid position 50 times before giving up and using a fallback
    while (!valid && attempts < 50) {
      x = Math.random() * 85 + 5; // 5% to 90% width
      y = Math.random() * 85 + 5; // 5% to 90% height
      
      // Forbidden Zone: Top 25% of screen AND horizontally centered (between 10% and 90%)
      const isTopCenter = y < 25 && x > 10 && x < 90;
      
      if (!isTopCenter) {
        valid = true;
      }
      attempts++;
    }
    
    // Fallback safe position
    if (!valid) {
      x = 10;
      y = 50; 
    }
    
    return { startX: x, startY: y };
  }, []);

  const duration = useMemo(() => 10 + Math.random() * 15, []); // Slow floating

  const handleClick = () => {
    if (found || isPopped) return;
    
    if (type === 'digit') {
      onFound(id);
    } else {
      setIsPopped(true);
    }
  };

  if (isPopped) return null; // Remove from DOM if popped
  if (found) return null; // Remove if found (handled by UI overlay)

  return (
    <motion.button
      className="absolute z-20 cursor-pointer"
      initial={{ left: `${startX}%`, top: `${startY}%`, scale: 0 }}
      animate={{ 
        scale: 1,
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
      }}
      transition={{ 
        scale: { duration: 0.5 },
        x: { duration: duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        y: { duration: duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
         <Heart 
           className={`${type === 'digit' ? 'text-pink-400' : 'text-purple-300'} drop-shadow-md`} 
           size={64} 
           fill="currentColor" 
         />
         <span className="absolute text-white font-bold text-xl opacity-50">?</span>
      </div>
    </motion.button>
  );
};

const SearchLevel = ({ onComplete }: { onComplete: () => void }) => {
  const [foundDigits, setFoundDigits] = useState<number[]>([]);

  // Prepare a list of items: The real digits + some decoys
  const items = useMemo(() => {
    const realItems = HIDDEN_DIGITS.map(d => ({ ...d, type: 'digit' as const }));
    const decoys = Array.from({ length: 12 }).map((_, i) => ({
      id: 100 + i, // offset ID for decoys
      digit: '',
      type: 'decoy' as const,
      found: false,
      position: { top: '0', left: '0' } // ignored
    }));
    // Shuffle slightly
    return [...realItems, ...decoys].sort(() => Math.random() - 0.5);
  }, []);

  const handleItemFound = (id: number) => {
    // Check if it is a real digit ID
    const isReal = HIDDEN_DIGITS.find(d => d.id === id);
    if (isReal && !foundDigits.includes(id)) {
      const newFound = [...foundDigits, id];
      setFoundDigits(newFound);
      if (newFound.length === HIDDEN_DIGITS.length) {
        setTimeout(onComplete, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CupidHelper context="Cifrele sunt ascunse în inimile plutitoare! Sparge inimile (click pe ele) pentru a găsi codul. Cele goale vor dispărea." />
      
      {/* Overlay UI - Code Tracker */}
      <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg border border-pink-300 backdrop-blur-sm">
          <h2 className="text-pink-600 font-bold mb-1 text-center text-sm md:text-base">
            Găsește cifrele! ({foundDigits.length}/{HIDDEN_DIGITS.length})
          </h2>
          <div className="flex gap-4 justify-center mt-2">
              {HIDDEN_DIGITS.map((part) => (
                <motion.div 
                  key={part.id} 
                  animate={foundDigits.includes(part.id) ? { scale: [1, 1.2, 1] } : {}}
                  className={`w-10 h-12 rounded flex items-center justify-center font-mono text-xl border-2 transition-colors ${
                    foundDigits.includes(part.id) 
                      ? 'bg-pink-100 border-pink-500 text-pink-700 font-bold shadow-inner' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {foundDigits.includes(part.id) ? part.digit : '?'}
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Floating Interactive Items */}
      {items.map((item) => (
        <FloatingItem 
          key={item.id}
          id={item.id}
          type={item.type}
          content={item.digit}
          onFound={handleItemFound}
          found={foundDigits.includes(item.id)}
        />
      ))}

      {/* Success Modal */}
      <AnimatePresence>
        {foundDigits.length === HIDDEN_DIGITS.length && (
           <motion.div 
             className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
           >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl text-center max-w-sm m-4 shadow-2xl border-4 border-pink-400"
              >
                <div className="mb-4 flex justify-center">
                  <Heart className="text-pink-500 w-16 h-16 animate-bounce" fill="currentColor" />
                </div>
                <h2 className="text-3xl font-bold text-purple-800 mb-2 fancy-font">Esti tare!</h2>
                <p className="text-gray-600 mb-4">Ai găsit toate părțile codului!</p>
                <div className="bg-purple-100 p-4 rounded-xl mb-4 border border-purple-200">
                  <p className="text-sm text-purple-600 uppercase tracking-widest mb-1">Codul Secret</p>
                  <p className="text-4xl font-mono font-bold text-purple-800 tracking-widest">{SECRET_CODE}</p>
                </div>
                <p className="text-sm text-gray-500 italic">Ține-l minte pentru mai târziu...</p>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Proposal Level ---
// --- Proposal Level ---
const ProposalLevel = ({ onYes }: { onYes: () => void }) => {
  const [noBtnState, setNoBtnState] = useState<{
    moved: boolean;
    top: number;
    left: number;
  }>({ moved: false, top: 0, left: 0 });

  const [hoverCount, setHoverCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const lastMoveTime = useRef<number>(0);

  // --- TEXTUL PENTRU ANIMATIE ---
  const questionText = "Vrei să fii Valentinul meu? 🥹";

  const noMessages = [
    "Nu", "Ești sigură?", "Mai gândește-te puțin... 🤔", "Dar te iubeeesc :(",
    "Îți iau ciocolată! 🍫", "Promit că spăl vasele! 🍽️", "Iu breic mai hart 💔",
    "Serios acum? 🤨", "Butonul ăsta e stricat... 🚫", "Nu poți scăpa de mine! 👻",
    "Ultima șansă! ⚠️", "WTFF ARIANAAAAA", "Apasă pe DA! 😡", "Bine, sa te vedem acum🌚"
  ];

  const MAX_CHARS = Math.max(...noMessages.map(m => m.length));
  const SAFE_WIDTH = (MAX_CHARS * 16) + 80; 
  const SAFE_HEIGHT = 100; 
  const EDGE_BUFFER = 20; 

  const moveNoButton = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastMoveTime.current < 250) return;
    lastMoveTime.current = now;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let maxX = windowWidth - SAFE_WIDTH - EDGE_BUFFER;
    let maxY = windowHeight - SAFE_HEIGHT - EDGE_BUFFER;
    if (maxX < 0) maxX = EDGE_BUFFER;
    if (maxY < 0) maxY = EDGE_BUFFER;
    const randomX = Math.random() * (maxX - EDGE_BUFFER) + EDGE_BUFFER;
    const randomY = Math.random() * (maxY - EDGE_BUFFER) + EDGE_BUFFER;
    setNoBtnState({ moved: true, top: randomY, left: randomX });
    setHoverCount(prev => prev + 1);
  };

  const handleMouseEnterYes = () => {
    timerRef.current = setTimeout(() => { setShowSecret(true); }, 5000);
  };

  const handleMouseLeaveYes = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setShowSecret(false);
  };

  const handleYes = () => {
      // --- SUNET YAY ---
      const audio = new Audio('/yay.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.error("Eroare la redare yay:", e));
      // -----------------

      setCelebrating(true);
      setTimeout(() => { onYes(); }, 3000);
  };

  const isEvaporated = hoverCount >= noMessages.length;
  const messageIndex = Math.min(hoverCount, noMessages.length - 1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <CupidHelper context="Acum este momentul cel mare. Nu o lăsa să apese butonul greșit!" />
      
      <AnimatePresence>
          {celebrating && (
              <motion.div 
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                  {Array.from({ length: 50 }).map((_, i) => (
                      <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                          animate={{ 
                              x: (Math.random() - 0.5) * 1000, y: (Math.random() - 0.5) * 1000, 
                              scale: Math.random() * 2 + 1, rotate: Math.random() * 360, opacity: 0
                          }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="absolute w-4 h-4 rounded-full"
                          style={{ 
                              backgroundColor: ['#ec4899', '#a855f7', '#fbbf24', '#3b82f6'][Math.floor(Math.random() * 4)],
                              left: '50%', top: '50%'
                          }}
                      />
                  ))}
                  <motion.h1 initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1] }} className="text-6xl md:text-8xl font-bold text-pink-600 fancy-font drop-shadow-lg bg-white/80 px-8 py-4 rounded-3xl">YEEEEEEY! ❤️</motion.h1>
              </motion.div>
          )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-lg p-10 rounded-[3rem] shadow-2xl border-4 border-red-300 max-w-2xl w-full"
      >
        <img 
          src={PROPOSAL_IMAGE} 
          alt="Romantic moment" 
          className="rounded-2xl mb-8 mx-auto shadow-md object-contain w-full h-auto max-h-[50vh]"
        />

        {/* --- MODIFICAREA PENTRU TEXT TIP "TYPEWRITER" --- */}
        <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-8 fancy-font leading-tight min-h-[60px]">
          {questionText.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.05,
                // Delay: 0.5 secunde (să apară cardul) + index * viteză
                delay: 0.5 + (index * 0.05) 
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        {/* ------------------------------------------------ */}
        
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center relative z-10 mt-8 w-full min-h-[100px]">
           <div className="relative">
             <AnimatePresence>
              {showSecret && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: -20, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-yellow-100 text-yellow-800 px-4 py-3 rounded-2xl shadow-xl border-2 border-yellow-300 text-sm font-bold whitespace-nowrap z-50 flex flex-col items-center"
                >
                  <span className="text-lg">🤫 Pssst!</span>
                  <span>Mergem la film: 14 Februarie, ora 19:00! 🥂</span>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-100 border-b-2 border-r-2 border-yellow-300 transform rotate-45"></div>
                </motion.div>
              )}
             </AnimatePresence>
            <button
              ref={yesBtnRef}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95 text-xl flex items-center gap-2 z-10"
              onMouseEnter={handleMouseEnterYes} onMouseLeave={handleMouseLeaveYes} onClick={handleYes}
            >
              <Heart fill="currentColor" /> DA!
            </button>
          </div>
          
          <AnimatePresence>
            {!isEvaporated && (
              <motion.button
                key="no-btn"
                style={{ position: noBtnState.moved ? 'fixed' : 'relative', zIndex: 50, width: 'fit-content' }}
                animate={ noBtnState.moved ? { left: noBtnState.left, top: noBtnState.top } : { x: 0, y: 0 } }
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onMouseOver={moveNoButton} onClick={moveNoButton} onTouchStart={moveNoButton}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-full shadow-md text-xl whitespace-nowrap min-w-[120px]"
              >
                {noMessages[messageIndex]}
              </motion.button>
            )}
          </AnimatePresence>
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
              {/* Using images from public folder list */}
              {GALLERY_IMAGES.map((imgSrc, index) => (
                <GalleryItem key={index} i={index} imageSrc={imgSrc} />
              ))}
            </div>
            
            {/* Interactive Letter */}
            <LoveLetter />

            {/* Date Night Jar */}
            <DateNightJar />

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
// --- Main App Component ---
const App = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);

  const handleStart = () => setGameState(GameState.QUIZ);
  const handleQuizComplete = () => setGameState(GameState.SEARCH);
  const handleSearchComplete = () => setGameState(GameState.PROPOSAL);
  const handleProposalYes = () => setGameState(GameState.GALLERY_LOCKED);

  // Verificăm dacă jocul a început (nu mai suntem pe ecranul de Welcome)
  const hasGameStarted = gameState !== GameState.WELCOME;

  return (
    <div className="font-sans text-gray-800 antialiased min-h-screen relative overflow-hidden">
        <Background />
        <FloatingHearts />
        <BackgroundCharacters />
        <ClickSparkles />
        
        {/* Pasăm prop-ul "startMusic" către MiniPlayer */}
        {/* Acesta va deveni TRUE exact când utilizatorul dă click pe "Începe Aventura" */}
        <MiniPlayer startMusic={hasGameStarted} />
        
        <AnimatePresence mode="wait">
            {gameState === GameState.WELCOME && (
                <motion.div key="welcome" className="absolute inset-0 overflow-y-auto" exit={{ opacity: 0 }}>
                    <WelcomeScreen onStart={handleStart} />
                </motion.div>
            )}
            
            {/* ... restul componentelor rămân la fel ... */}
            
            {gameState === GameState.QUIZ && (
                <motion.div key="quiz" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <QuizLevel onComplete={handleQuizComplete} />
                </motion.div>
            )}

            {gameState === GameState.SEARCH && (
                <motion.div key="search" className="absolute inset-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SearchLevel onComplete={handleSearchComplete} />
                </motion.div>
            )}

            {gameState === GameState.PROPOSAL && (
                <motion.div key="proposal" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProposalLevel onYes={handleProposalYes} />
                </motion.div>
            )}

            {(gameState === GameState.GALLERY_LOCKED || gameState === GameState.GALLERY_OPEN) && (
                <motion.div key="gallery" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Gallery />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default App;