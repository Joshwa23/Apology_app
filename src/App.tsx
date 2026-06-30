import React, { useState, useEffect, useRef } from "react";
import cryingImg from "./assets/images/crying_apology_cute_1782816292081.jpg";
import loveImg from "./assets/images/love_chibi_hug_1782816311567.jpg";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Smile, 
  Frown, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Gift, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  User, 
  RefreshCw, 
  Star,
  Award
} from "lucide-react";

// Types
interface PromiseItem {
  id: number;
  text: string;
  checked: boolean;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  char: string;
  size: number;
  speed: number;
}

interface GameHeart {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export default function App() {
  // Navigation states: 1 = Crying/Ask, 2 = Sincere Apology (Content), 3 = I Love You (Content)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  
  // Page 1 States
  const [noBtnOffset, setNoBtnOffset] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const [showNoAlert, setShowNoAlert] = useState(false);
  const [sadHeartCracked, setSadHeartCracked] = useState(false);
  
  // Page 2 States
  const [madness, setMadness] = useState<number>(85); // Starts at 85% mad
  const [activeTab, setActiveTab] = useState<"letter" | "promises" | "memories">("letter");
  const [promises, setPromises] = useState<PromiseItem[]>([
    { id: 1, text: "I promise I'll never overreact. 🥺❤️", checked: false },
    { id: 2, text: "I promise I'll always answer your call and never cut it when we have a problem. 📞💬", checked: false },
    { id: 3, text: "I promise we'll solve our problems on the same day. 🌅🤝", checked: false },
    { id: 4, text: "I promise I'll always listen to you before making assumptions. 👂✨", checked: false },
    { id: 5, text: "I promise to love, respect, and choose you every single day. ❤️👑", checked: false },
  ]);
  const [virtualActionText, setVirtualActionText] = useState<string>("");

  // Page 3 States
  const [currentReasonIdx, setCurrentReasonIdx] = useState<number>(0);
  const [loveCharge, setLoveCharge] = useState<number>(100);
  const [hasUnlockedContract, setHasUnlockedContract] = useState<boolean>(false);
  const [contractSigned, setContractSigned] = useState<boolean>(false);
  const [loverName, setLoverName] = useState<string>("");
  const [partnerReply, setPartnerReply] = useState<string>("");
  const [savedReplies, setSavedReplies] = useState<string[]>([]);
  
  // Heart Catcher Mini Game States
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameHearts, setGameHearts] = useState<GameHeart[]>([]);
  const [basketX, setBasketX] = useState<number>(50); // percentage 0 - 100
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const loveReasons = [
    "Your laugh that instantly sweeps away all my worries. 😄",
    "The cute way you pout when you are slightly annoyed (even though I never want to make you really sad!). 🥺",
    "How safe and complete I feel when my hand is held in yours. 🤝",
    "The kindness you show to everyone around you, reflecting your beautiful soul. 🌟",
    "Our silly jokes and how we can talk for hours about absolutely nothing. 💬",
    "The way you believe in me, even on the days I struggle to believe in myself. 💖",
    "Your warm and loving heart that makes the whole world a happier place. 🏡"
  ];

  const funnyNoMessages = [
    "Wait, are you sure? 🥺",
    "Please reconsider! I'll give you chocolate! 🍫",
    "But look at my cute crying face! 😭",
    "I will buy you double ice cream! 🍦🍦",
    "No is not an option in my dictionary of love! 📖❤️",
    "My heart is literally beating for you right now... 💓",
    "Fine, click Yes and I'll do a funny dance! 💃",
    "Pleeeeease forgive me? 🙏"
  ];

  // Particle generator for custom actions (Hug, Kiss, Stars)
  const spawnParticles = (char: string, count: number = 20) => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50,
      char: char,
      size: Math.random() * 30 + 15,
      speed: Math.random() * 3 + 2,
    }));
    setHearts((prev) => [...prev, ...newParticles]);
  };

  // Heart floating loop
  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) =>
        prev
          .map((h) => ({ ...h, y: h.y - h.speed }))
          .filter((h) => h.y > -100)
      );
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Spawn random subtle background hearts periodically on Page 3
  useEffect(() => {
    if (currentPage === 3) {
      const bghInterval = setInterval(() => {
        const h: HeartParticle = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
          char: Math.random() > 0.5 ? "❤️" : "🌸",
          size: Math.random() * 20 + 10,
          speed: Math.random() * 1.5 + 0.5,
        };
        setHearts((prev) => [...prev, h]);
      }, 1500);
      return () => clearInterval(bghInterval);
    }
  }, [currentPage]);

  // Handle "No" button escaping
  const escapeNoButton = () => {
    const randomX = (Math.random() - 0.5) * 260;
    const randomY = (Math.random() - 0.5) * 140;
    setNoBtnOffset({ x: randomX, y: randomY });
    setNoCount((prev) => prev + 1);
    if (noCount > 4) {
      setShowNoAlert(true);
    }
  };

  // Virtual actions in Page 2
  const handleVirtualAction = (action: "hug" | "kiss" | "tickle") => {
    if (action === "hug") {
      setVirtualActionText("Sent you a giant, cozy, infinite virtual hug! 🫂💓 Feel the warmth!");
      spawnParticles("🫂", 20);
      setMadness((prev) => Math.max(0, prev - 15));
    } else if (action === "kiss") {
      setVirtualActionText("Sent a shower of sweet, warm kisses directly to your forehead! 💋💖");
      spawnParticles("💋", 25);
      setMadness((prev) => Math.max(0, prev - 15));
    } else {
      setVirtualActionText("Eeeek! virtual tickle attack! 😂 Cute giggles only!");
      spawnParticles("✨", 15);
      setMadness((prev) => Math.max(0, prev - 10));
    }
  };

  // Heart Catcher Mini-Game Loop
  const startCatcherGame = () => {
    setGameScore(0);
    setGameHearts([]);
    setHasUnlockedContract(false);
    
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    
    gameIntervalRef.current = setInterval(() => {
      // Spawn new heart
      const newHeart: GameHeart = {
        id: Math.random(),
        x: Math.random() * 90 + 5, // 5% to 95% width
        y: 0,
        speed: Math.random() * 2 + 1.5,
      };
      
      setGameHearts((prev) => {
        // Move existing hearts down
        const updated = prev
          .map((h) => ({ ...h, y: h.y + h.speed }))
          .filter((h) => h.y < 100); // filter out out-of-bound
          
        return [...updated, newHeart];
      });
    }, 450);
  };

  // Handle Game Heart falling updates and collision detection
  useEffect(() => {
    if (currentPage !== 3) {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
      return;
    }

    const collisionInterval = setInterval(() => {
      setGameHearts((prev) => {
        const remaining: GameHeart[] = [];
        let hitCount = 0;

        for (const h of prev) {
          // Collision box: y between 82% and 94% height, x within 8% of basketX
          if (h.y >= 80 && h.y <= 92 && Math.abs(h.x - basketX) < 12) {
            hitCount++;
          } else if (h.y < 100) {
            remaining.push(h);
          }
        }

        if (hitCount > 0) {
          setGameScore((score) => {
            const nextScore = score + hitCount;
            if (nextScore >= 10 && !hasUnlockedContract) {
              setHasUnlockedContract(true);
              spawnParticles("🎉", 15);
            }
            return nextScore;
          });
        }

        return remaining;
      });
    }, 50);

    return () => clearInterval(collisionInterval);
  }, [currentPage, basketX, hasUnlockedContract]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(5, Math.min(95, relativeX)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || e.touches.length === 0) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(5, Math.min(95, relativeX)));
  };

  // Submit dynamic response
  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerReply.trim()) return;
    setSavedReplies((prev) => [partnerReply.trim(), ...prev]);
    setPartnerReply("");
    spawnParticles("❤️", 15);
  };

  return (
    <div className="min-h-screen bg-linear-to-tr from-rose-50 via-pink-50 to-rose-100 flex flex-col justify-between overflow-x-hidden font-sans text-neutral-800">
      
      {/* Floating particles background overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {hearts.map((h) => (
          <span
            key={h.id}
            style={{
              left: `${h.x}px`,
              top: `${h.y}px`,
              fontSize: `${h.size}px`,
              textShadow: "0 4px 8px rgba(0,0,0,0.05)",
            }}
            className="absolute transition-transform duration-75 select-none"
          >
            {h.char}
          </span>
        ))}
      </div>

      {/* Elegant Header with Stepper Progress */}
      <header className="px-6 py-4 max-w-xl mx-auto w-full flex items-center justify-between border-b border-neutral-100/50 bg-white/40 backdrop-blur-md rounded-b-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-400 animate-pulse" />
          <span className="font-display font-bold text-neutral-800 tracking-tight text-sm">Apology &amp; Love Note</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${currentPage >= 1 ? "bg-rose-500 text-white" : "bg-neutral-200 text-neutral-500"}`}>1</div>
          <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${currentPage >= 2 ? "bg-rose-500" : "bg-neutral-200"}`} />
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${currentPage >= 2 ? "bg-rose-500 text-white" : "bg-neutral-200 text-neutral-500"}`}>2</div>
          <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${currentPage >= 3 ? "bg-rose-500" : "bg-neutral-200"}`} />
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${currentPage >= 3 ? "bg-rose-500 text-white" : "bg-neutral-200 text-neutral-500"}`}>3</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* =======================================================
              PAGE 1: THE CRYING HOME PAGE
              ======================================================= */}
          {currentPage === 1 && (
            <motion.div
              key="page-1"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-white/80 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-xl border border-rose-100 flex flex-col items-center text-center space-y-6"
            >
              <div className="relative">
                <span className="absolute -top-3 -right-3 text-3xl animate-bounce">🥺</span>
                <h1 className="font-display font-extrabold text-2xl md:text-3xl text-neutral-900 leading-tight">
                  I am so sorry, my love...
                </h1>
                <p className="text-sm font-medium text-rose-500 font-display tracking-widest uppercase mt-1">Please hear me out</p>
              </div>

              {/* Crying Chibi Image */}
              <div className="relative w-52 h-52 rounded-2xl overflow-hidden border-4 border-rose-200/50 shadow-md bg-rose-50 group">
                <img
                  src={cryingImg}
                  alt="I am crying and so sorry"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Sad message description */}
              <div className="space-y-3 px-2">
                <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-serif italic">
                  &ldquo;I know I made a mistake, and honestly, seeing you hurt is the worst feeling in the world. My whole day feels completely gray without you.&rdquo;
                </p>
                <p className="text-neutral-500 text-xs">
                  I made this little page to show you how much you mean to me. Will you give me a chance to apologize properly?
                </p>
              </div>

              {/* Cracking Heart Interactive */}
              <div className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => {
                    setSadHeartCracked(!sadHeartCracked);
                    spawnParticles(sadHeartCracked ? "💖" : "💔", 8);
                  }}
                  className="p-3 bg-rose-50 hover:bg-rose-100/80 rounded-full transition-all transform hover:scale-110 active:scale-95 group"
                  title="Click to heal my heart"
                >
                  <Heart className={`w-8 h-8 transition-all duration-300 ${sadHeartCracked ? "text-neutral-300" : "text-rose-500 fill-rose-500 animate-pulse group-hover:scale-105"}`} />
                </button>
                <span className="text-[10px] text-neutral-400">
                  {sadHeartCracked ? "Oh no, you cracked my heart! Tap again to heal! 🩹" : "Tap the heart to check my heartbeat"}
                </span>
              </div>

              {/* Buttons Set: Click Button to next, escaping No button */}
              <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative min-h-[90px]">
                
                {/* YES BUTTON (Proceed to apology content) */}
                <button
                  onClick={() => {
                    spawnParticles("❤️", 25);
                    setCurrentPage(2);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-display font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-98 animate-pulse-subtle flex items-center justify-center gap-2 cursor-pointer z-10"
                >
                  <span>Yes, I will listen 🥺</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* NO BUTTON (Escaping/Moving on hover or click) */}
                <button
                  onMouseEnter={escapeNoButton}
                  onClick={() => {
                    escapeNoButton();
                    // Just in case they capture it on touchscreen
                    if (noCount > 2) {
                      setShowNoAlert(true);
                    }
                  }}
                  style={{
                    transform: `translate(${noBtnOffset.x}px, ${noBtnOffset.y}px)`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-2xl font-display font-semibold text-xs border border-neutral-200/50 transition-colors z-20"
                >
                  No, suffer more! 😤
                </button>
              </div>

              {/* Dynamic cheeky alerts when they try to click NO */}
              {showNoAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium"
                >
                  <p className="flex items-center gap-1 justify-center">
                    <span>💡 {funnyNoMessages[noCount % funnyNoMessages.length]}</span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* =======================================================
              PAGE 2: THE APOLOGY DETAILS ("sry solra mari content")
              ======================================================= */}
          {currentPage === 2 && (
            <motion.div
              key="page-2"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-white/85 backdrop-blur-lg rounded-3xl p-5 md:p-8 shadow-xl border border-rose-100 flex flex-col space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="font-display font-extrabold text-2xl text-neutral-950 flex items-center justify-center gap-1.5">
                  My Apology &amp; Promises 😭
                </h2>
                <p className="text-xs text-neutral-500">I promise to make things right. Let me show you how:</p>
              </div>

              {/* Navigation Tabs for Page 2 content */}
              <div className="flex bg-neutral-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("letter")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "letter" ? "bg-white text-rose-600 shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
                >
                  Apology Letter 💌
                </button>
                <button
                  onClick={() => setActiveTab("promises")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "promises" ? "bg-white text-rose-600 shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
                >
                  My Promises 🤝
                </button>
                <button
                  onClick={() => setActiveTab("memories")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "memories" ? "bg-white text-rose-600 shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
                >
                  Virtual Hugs 🧸
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[220px]">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: APOLOGY LETTER */}
                  {activeTab === "letter" && (
                    <motion.div
                      key="tab-letter"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100/50 space-y-3 text-neutral-700">
                        <p className="font-serif italic text-sm md:text-base leading-relaxed">
                          &ldquo;Sorry, my love. ❤️&rdquo;
                        </p>
                        <p className="font-serif italic text-sm md:text-base leading-relaxed">
                          &ldquo;I never meant to overreact or hurt you. Whenever something happens, you're always the first person I want to call because I believe we should talk and clear things up together. If I made you feel bad, I'm truly sorry.&rdquo;
                        </p>
                        <p className="font-serif italic text-sm md:text-base leading-relaxed">
                          &ldquo;Please know that I love you so much, and I never want anything to come between us. You mean everything to me. I love you, always. ❤️&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-xs text-rose-500 font-semibold bg-rose-50 py-2 px-4 rounded-xl w-fit mx-auto">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>I will always keep your happiness as my #1 priority!</span>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: MY PROMISES */}
                  {activeTab === "promises" && (
                    <motion.div
                      key="tab-promises"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-neutral-500 italic text-center">Tap each promise to accept and seal it in my heart 💖</p>
                      <div className="space-y-2">
                        {promises.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              const updated = promises.map((item) =>
                                item.id === p.id ? { ...item, checked: !item.checked } : item
                              );
                              setPromises(updated);
                              if (!p.checked) {
                                spawnParticles("✨", 8);
                                setMadness((prev) => Math.max(0, prev - 10));
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${p.checked ? "bg-rose-50/70 border-rose-200 text-rose-900" : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"}`}
                          >
                            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${p.checked ? "text-rose-500 fill-rose-100" : "text-neutral-400"}`} />
                            <span className="text-xs md:text-sm font-medium">{p.text}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: VIRTUAL ACTIONS */}
                  {activeTab === "memories" && (
                    <motion.div
                      key="tab-memories"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 text-center"
                    >
                      <p className="text-xs text-neutral-500">Since I cannot be with you physically right now, send yourself one of these cute virtual tokens:</p>
                      
                      <div className="grid grid-cols-3 gap-2.5">
                        <button
                          onClick={() => handleVirtualAction("hug")}
                          className="p-3 bg-rose-50 hover:bg-rose-100/80 rounded-xl flex flex-col items-center gap-1.5 border border-rose-100 transition-all transform hover:scale-102"
                        >
                          <span className="text-2xl">🫂</span>
                          <span className="text-[10px] font-bold text-rose-600">Virtual Hug</span>
                        </button>
                        <button
                          onClick={() => handleVirtualAction("kiss")}
                          className="p-3 bg-pink-50 hover:bg-pink-100/80 rounded-xl flex flex-col items-center gap-1.5 border border-pink-100 transition-all transform hover:scale-102"
                        >
                          <span className="text-2xl">💋</span>
                          <span className="text-[10px] font-bold text-pink-600">Blow Kiss</span>
                        </button>
                        <button
                          onClick={() => handleVirtualAction("tickle")}
                          className="p-3 bg-amber-50 hover:bg-amber-100/80 rounded-xl flex flex-col items-center gap-1.5 border border-amber-100 transition-all transform hover:scale-102"
                        >
                          <span className="text-2xl">🧸</span>
                          <span className="text-[10px] font-bold text-amber-700">Send Teddy</span>
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {virtualActionText && (
                          <motion.div
                            key={virtualActionText}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/50 text-xs text-neutral-700 font-medium"
                          >
                            {virtualActionText}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Madness Slider Meter (Extremely Interactive Apology Acceptance Check) */}
              <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-neutral-600">Your Anger Meter 🌡️</span>
                  <span className="text-xs font-bold text-rose-600 font-mono">
                    {madness === 100 ? "🤬 Furious (100%)" :
                     madness >= 75 ? "😤 Highly annoyed" :
                     madness >= 50 ? "😐 Thinking about it" :
                     madness >= 25 ? "🥺 Forgiving slightly" :
                     madness > 0 ? "😌 Melting... ( hampir )" : "🥰 Fully melted (0% Anger)"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={madness}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMadness(val);
                    if (val === 0) {
                      spawnParticles("❤️", 15);
                    }
                  }}
                  className="w-full accent-rose-500 h-2 bg-neutral-200 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-neutral-400 text-center">
                  Drag the slider to <span className="text-rose-500 font-semibold">0% Anger</span> to completely melt and forgive me! 😊
                </p>
              </div>

              {/* Navigation controls */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-4 py-2 text-neutral-500 text-xs font-semibold flex items-center gap-1 hover:text-neutral-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => {
                    spawnParticles("💖", 30);
                    setCurrentPage(3);
                    startCatcherGame();
                  }}
                  disabled={madness > 30 && promises.filter((p) => p.checked).length < 2}
                  className={`px-6 py-3 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    madness <= 30 || promises.filter((p) => p.checked).length >= 2
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  <span>See My True Feeling ❤️</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Help hint if the button is disabled */}
              {madness > 30 && promises.filter((p) => p.checked).length < 2 && (
                <p className="text-[10px] text-neutral-400 text-center italic">
                  *Tip: Please accept at least 2 promises or slide the Anger Meter below 30% to unlock my true feeling! 😊
                </p>
              )}
            </motion.div>
          )}

          {/* =======================================================
              PAGE 3: THE FOREVER LOVE CONFESSION ("i love u content")
              ======================================================= */}
          {currentPage === 3 && (
            <motion.div
              key="page-3"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-white/85 backdrop-blur-lg rounded-3xl p-5 md:p-8 shadow-xl border border-rose-100 flex flex-col space-y-6"
            >
              
              <div className="text-center space-y-1">
                <div className="inline-flex p-2 bg-rose-50 rounded-full text-rose-500 animate-pulse">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-neutral-900 tracking-tight">
                  I Love You More Than Ever!
                </h2>
                <p className="text-xs text-rose-500 font-semibold font-display uppercase tracking-widest">Our Happy Chapter 🌸</p>
              </div>

              {/* Chibi cuddling/love illustration */}
              <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-4 border-rose-200/50 shadow-md bg-rose-50 group">
                <img
                  src={loveImg}
                  alt="I love you so much hugging"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="px-2 py-0.5 bg-rose-500/90 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">My Forever Place</span>
                </div>
              </div>

              {/* Carousel Deck: Reasons I Love You */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50/60 p-5 rounded-2xl border border-rose-100/40 shadow-xs relative">
                <div className="absolute -top-3 -left-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Reason #{currentReasonIdx + 1}
                </div>
                
                <div className="min-h-[80px] flex items-center justify-center text-center px-2 py-3">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentReasonIdx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-serif text-sm md:text-base text-neutral-700 leading-relaxed font-medium italic"
                    >
                      &ldquo;{loveReasons[currentReasonIdx]}&rdquo;
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-rose-100/50">
                  <button
                    onClick={() => {
                      setCurrentReasonIdx((prev) => (prev === 0 ? loveReasons.length - 1 : prev - 1));
                      spawnParticles("🌸", 4);
                    }}
                    className="p-1.5 hover:bg-white rounded-lg text-neutral-500 hover:text-rose-500 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {currentReasonIdx + 1} of {loveReasons.length}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentReasonIdx((prev) => (prev === loveReasons.length - 1 ? 0 : prev + 1));
                      spawnParticles("🌸", 4);
                    }}
                    className="p-1.5 hover:bg-white rounded-lg text-neutral-500 hover:text-rose-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Love Charger Button */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-2xs space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-600">Love battery with you:</span>
                  <span className="font-bold text-rose-500 font-mono">
                    {loveCharge === 100 ? "100% (Standard)" :
                     loveCharge < 1000 ? `${loveCharge}%` :
                     loveCharge < 1000000 ? "1000,000% (Infinite!)" : "🌟 INFINITY &amp; BEYOND!"}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (loveCharge / 1000) * 100)}%` }}
                    className="bg-linear-to-r from-rose-400 to-pink-500 h-full rounded-full transition-all duration-300"
                  />
                </div>
                <button
                  onClick={() => {
                    setLoveCharge((prev) => (prev >= 1000000 ? prev : prev + 250));
                    spawnParticles("💖", 10);
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold font-display transition-all transform active:scale-97 flex items-center justify-center gap-1.5 border border-rose-200/50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tap to Charge My Love 🔋💓</span>
                </button>
              </div>

              {/* Heart Catcher Interactive mini-game! */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Catch Falling Hearts!</span>
                  </span>
                  <span className="text-xs font-bold text-neutral-600">
                    Hearts Caught: <span className="text-rose-500">{gameScore}</span> / 10
                  </span>
                </div>

                {/* Game container box */}
                <div
                  ref={gameAreaRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative h-44 bg-pink-50/50 border border-pink-100 rounded-xl overflow-hidden cursor-crosshair select-none"
                >
                  {/* Instructions overlay inside game */}
                  {gameScore === 0 && gameHearts.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none bg-white/20">
                      <p className="text-xs font-bold text-neutral-700">Can you catch 10 hearts? 🥺</p>
                      <p className="text-[10px] text-neutral-500">Move your finger/mouse to drag the catcher</p>
                    </div>
                  )}

                  {/* Falling hearts */}
                  {gameHearts.map((gh) => (
                    <div
                      key={gh.id}
                      style={{
                        left: `${gh.x}%`,
                        top: `${gh.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute text-xl pointer-events-none transition-all duration-75"
                    >
                      ❤️
                    </div>
                  ))}

                  {/* Basket / Catcher */}
                  <div
                    style={{
                      left: `${basketX}%`,
                      bottom: "5px",
                      transform: "translateX(-50%)",
                    }}
                    className="absolute bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md border border-white"
                  >
                    <span>🫂</span>
                    <span>CATCHER</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-neutral-400">
                  <span>Drag catcher at bottom</span>
                  <button
                    onClick={startCatcherGame}
                    className="text-rose-500 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Restart Game</span>
                  </button>
                </div>
              </div>

              {/* The Love Contract (Unlocked after catching 10 hearts) */}
              {hasUnlockedContract && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-linear-to-b from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-md text-center space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1 bg-amber-500 text-white rounded-bl-xl text-[9px] font-bold uppercase">
                    Unlocked!
                  </div>
                  <Award className="w-8 h-8 text-amber-500 mx-auto fill-amber-100" />
                  <h3 className="font-display font-bold text-sm text-neutral-900 uppercase tracking-wider">
                    📜 The Ultimate Forever Contract
                  </h3>
                  
                  <div className="space-y-1 text-xs text-neutral-600 px-2 font-serif italic leading-relaxed">
                    <p>&ldquo;This document certifies that you own my heart completely. There are no refunds, returns, or exchange options allowed. You are locked into an eternity of kisses, hugs, and endless support.&rdquo;</p>
                  </div>

                  {!contractSigned ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Write your sweet name here..."
                        value={loverName}
                        onChange={(e) => setLoverName(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs text-center focus:outline-hidden focus:border-amber-400 font-semibold"
                      />
                      <button
                        onClick={() => {
                          if (loverName.trim()) {
                            setContractSigned(true);
                            spawnParticles("💖", 30);
                          } else {
                            alert("Please enter your name to sign the contract! 🥰");
                          }
                        }}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all transform active:scale-97"
                      >
                        Sign with Love ✍️❤️
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-2.5 bg-white rounded-xl border border-green-200 text-xs text-green-700 font-bold"
                    >
                      🎉 Contract signed! My heart is officially yours forever, {loverName}! 🔒❤️
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Dynamic Post-It Board for reply from the lover */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-600 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Leave your reply or custom rule here:</span>
                </h4>
                
                <form onSubmit={handleAddReply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 'You must buy me momos!' or 'I forgive you ❤️'"
                    value={partnerReply}
                    onChange={(e) => setPartnerReply(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-rose-300 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold font-display transition-all transform active:scale-97 cursor-pointer"
                  >
                    Post It 📌
                  </button>
                </form>

                {/* Saved reply sticky notes board */}
                {savedReplies.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    {savedReplies.map((reply, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9, rotate: i % 2 === 0 ? -2 : 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-amber-100 border border-amber-200 shadow-xs rounded-lg text-[11px] text-amber-900 font-serif italic relative min-h-[50px] flex items-center"
                      >
                        <span className="absolute -top-1 -left-1 text-xs">📌</span>
                        <span>{reply}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Back to Apology Page navigation */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(2)}
                  className="px-4 py-2 text-neutral-500 text-xs font-semibold flex items-center gap-1 hover:text-neutral-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Go to Apology Letter</span>
                </button>
                
                <button
                  onClick={() => {
                    spawnParticles("❤️", 30);
                    setMadness(100);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 text-[10px] font-semibold rounded-lg transition-colors"
                >
                  Restart Story
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant Footer signature */}
      <footer className="py-4 text-center text-neutral-400 text-[10px] font-medium max-w-xl mx-auto w-full">
        Made with infinite love, patience, and a whole heart of regret. 🥺❤️
      </footer>
    </div>
  );
}

