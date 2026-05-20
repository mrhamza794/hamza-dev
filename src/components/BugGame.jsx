import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, RotateCcw, Share2, SkipForward } from "lucide-react";

const GAME_DURATION = 30;
const HIGH_SCORE_KEY = "bugGameHighScore";
const COMBO_WINDOW_MS = 1500;

const BUG_COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6"];
const BUG_EMOJIS = ["🐛", "🐞", "🦟", "🪲"];

const SCORE_MESSAGES = [
  { max: 5, text: "Just getting started! 🐛" },
  { max: 10, text: "Not bad for a human! 😊" },
  { max: 15, text: "Bug Hunter! 🎯" },
  { max: 20, text: "Senior Debugger! 🔥" },
  { max: 25, text: "Legendary Developer! ⭐" },
  { max: Infinity, text: "Bug Terminator! 🚀 Are you even human?" },
];

function getScoreMessage(score) {
  return SCORE_MESSAGES.find((m) => score <= m.max)?.text ?? SCORE_MESSAGES[0].text;
}

function getBugConfig(width) {
  if (width < 768) return { count: 6, size: 55, hitPad: 20 };
  if (width < 1024) return { count: 8, size: 45, hitPad: 16 };
  return { count: 10, size: 50, hitPad: 16 };
}

function randomVelocity(speed = 2.5) {
  const angle = Math.random() * Math.PI * 2;
  const mag = speed * (0.6 + Math.random() * 0.8);
  return {
    vx: Math.cos(angle) * mag,
    vy: Math.sin(angle) * mag,
  };
}

function createBug(id, bounds, size) {
  const maxX = Math.max(0, bounds.width - size);
  const maxY = Math.max(0, bounds.height - size);
  const speed = 1.8 + Math.random() * 2.2;

  return {
    id,
    x: Math.random() * maxX,
    y: Math.random() * maxY,
    size,
    ...randomVelocity(speed),
    color: BUG_COLORS[Math.floor(Math.random() * BUG_COLORS.length)],
    emoji: BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)],
    wiggle: Math.random() * 360,
  };
}

function getComboPoints(combo) {
  if (combo >= 5) return 3;
  if (combo >= 3) return 2;
  return 1;
}

export default function BugGame() {
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bugs, setBugs] = useState([]);
  const [particles, setParticles] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [bounds, setBounds] = useState({ width: 900, height: 600 });
  const [bugConfig, setBugConfig] = useState(() => getBugConfig(900));

  const gameAreaRef = useRef(null);
  const rafRef = useRef(null);
  const bugsRef = useRef([]);
  const comboRef = useRef(0);
  const lastSquashRef = useRef(0);
  const scoreRef = useRef(0);
  const gameStateRef = useRef("start");
  const boundsRef = useRef(bounds);
  const bugConfigRef = useRef(bugConfig);

  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    boundsRef.current = bounds;
    bugConfigRef.current = bugConfig;
  }, [bounds, bugConfig]);

  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) setHighScore(parseInt(saved, 10) || 0);
  }, []);

  const measureArea = useCallback(() => {
    const el = gameAreaRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    setBounds({ width: w, height: h });
    setBugConfig(getBugConfig(window.innerWidth));
  }, []);

  useEffect(() => {
    measureArea();
    const el = gameAreaRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(measureArea);
    ro.observe(el);
    window.addEventListener("resize", measureArea);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureArea);
    };
  }, [measureArea]);

  const spawnBugs = useCallback((count) => {
    const b = boundsRef.current;
    const cfg = bugConfigRef.current;
    const list = Array.from({ length: count }, (_, i) =>
      createBug(`${Date.now()}-${i}`, b, cfg.size)
    );
    setBugs(list);
    bugsRef.current = list;
  }, []);

  const startGame = useCallback(() => {
    comboRef.current = 0;
    lastSquashRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setParticles([]);
    setScorePopups([]);
    setShareCopied(false);
    setNewRecord(false);
    setBugs([]);
    gameStateRef.current = "playing";
    setGameState("playing");

    requestAnimationFrame(() => {
      measureArea();
      const el = gameAreaRef.current;
      const rect = el?.getBoundingClientRect();
      const b = {
        width: Math.floor(rect?.width || 0) || 800,
        height: Math.floor(rect?.height || 0) || 450,
      };
      boundsRef.current = b;
      setBounds(b);

      const cfg = getBugConfig(window.innerWidth);
      setBugConfig(cfg);
      bugConfigRef.current = cfg;
      spawnBugs(cfg.count);
    });
  }, [measureArea, spawnBugs]);

  const endGame = useCallback(() => {
    if (gameStateRef.current !== "playing") return;
    setGameState("gameover");
    gameStateRef.current = "gameover";
    setBugs([]);
    bugsRef.current = [];

    const final = scoreRef.current;
    setHighScore((prev) => {
      if (final > prev) {
        localStorage.setItem(HIGH_SCORE_KEY, String(final));
        setNewRecord(true);
        return final;
      }
      setNewRecord(false);
      return prev;
    });
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return undefined;

    const tick = () => {
      const b = boundsRef.current;
      const cfg = bugConfigRef.current;
      const size = cfg.size;

      setBugs((prev) =>
        prev.map((bug) => {
          let { x, y, vx, vy } = bug;
          const maxX = b.width - size;
          const maxY = b.height - size;

          if (Math.random() < 0.03) {
            vx += (Math.random() - 0.5) * 0.4;
            vy += (Math.random() - 0.5) * 0.4;
            const maxSpeed = 4.2;
            const speed = Math.hypot(vx, vy) || 1;
            if (speed > maxSpeed) {
              vx = (vx / speed) * maxSpeed;
              vy = (vy / speed) * maxSpeed;
            }
          }

          x += vx;
          y += vy;

          if (x <= 0) {
            x = 0;
            vx = Math.abs(vx) * 0.95;
          } else if (x >= maxX) {
            x = maxX;
            vx = -Math.abs(vx) * 0.95;
          }
          if (y <= 0) {
            y = 0;
            vy = Math.abs(vy) * 0.95;
          } else if (y >= maxY) {
            y = maxY;
            vy = -Math.abs(vy) * 0.95;
          }

          return {
            ...bug,
            x,
            y,
            vx,
            vy,
            wiggle: bug.wiggle + 2.5,
          };
        })
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return undefined;

    setTimeLeft(GAME_DURATION);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endGame]);

  const createParticles = useCallback((x, y, color, isMobile) => {
    const count = isMobile ? 6 : 10;
    const centerX = x + bugConfigRef.current.size / 2;
    const centerY = y + bugConfigRef.current.size / 2;
    const batch = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-p-${i}`,
      x: centerX,
      y: centerY,
      angle: (Math.PI * 2 * i) / count + Math.random() * 0.4,
      color,
      dist: 35 + Math.random() * 25,
    }));
    setParticles((prev) => [...prev, ...batch]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !batch.some((b) => b.id === p.id)));
    }, 520);
  }, []);

  const squashBug = useCallback(
    (bugId, bug) => {
      if (gameStateRef.current !== "playing") return;

      const now = Date.now();
      if (now - lastSquashRef.current < COMBO_WINDOW_MS) {
        comboRef.current += 1;
      } else {
        comboRef.current = 1;
      }
      lastSquashRef.current = now;

      const points = getComboPoints(comboRef.current);
      const centerX = bug.x + bug.size / 2;
      const centerY = bug.y + bug.size / 2;

      setBugs((prev) => {
        const next = prev.filter((b) => b.id !== bugId);
        bugsRef.current = next;
        return next;
      });

      setScore((s) => {
        const next = s + points;
        scoreRef.current = next;
        return next;
      });

      const popupId = `popup-${Date.now()}`;
      setScorePopups((prev) => [
        ...prev,
        {
          id: popupId,
          x: centerX,
          y: centerY,
          text: comboRef.current >= 3 ? `+${points} x${comboRef.current}!` : `+${points}`,
        },
      ]);
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 800);

      createParticles(bug.x, bug.y, bug.color, window.innerWidth < 768);

      setTimeout(() => {
        if (gameStateRef.current !== "playing") return;
        const cfg = bugConfigRef.current;
        const newBug = createBug(`${Date.now()}-spawn`, boundsRef.current, cfg.size);
        setBugs((prev) => {
          const next = [...prev, newBug];
          bugsRef.current = next;
          return next;
        });
      }, 180);
    },
    [createParticles]
  );

  const squashNearestBug = useCallback(() => {
    if (gameStateRef.current !== "playing" || bugsRef.current.length === 0) return;
    const b = boundsRef.current;
    const cx = b.width / 2;
    const cy = b.height / 2;
    let nearest = bugsRef.current[0];
    let minDist = Infinity;
    bugsRef.current.forEach((bug) => {
      const dx = bug.x + bug.size / 2 - cx;
      const dy = bug.y + bug.size / 2 - cy;
      const d = dx * dx + dy * dy;
      if (d < minDist) {
        minDist = d;
        nearest = bug;
      }
    });
    squashBug(nearest.id, nearest);
  }, [squashBug]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && gameStateRef.current === "playing") {
        e.preventDefault();
        squashNearestBug();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [squashNearestBug]);

  const shareScore = async () => {
    const text = `I squashed ${score} bugs on Hamza's portfolio! Can you beat that? 🐛`;
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      setShareCopied(false);
    }
  };

  const progress = (timeLeft / GAME_DURATION) * 100;
  const isLowTime = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <section
      id="bug-game"
      className="relative scroll-mt-24 py-24 px-4 sm:px-6 md:py-32"
      aria-labelledby="bug-game-title"
      data-lenis-prevent
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-12">
          <h2 id="bug-game-title" className="font-space text-4xl font-bold text-gradient sm:text-5xl md:text-6xl">
            Debug Challenge
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 md:text-xl">
            How many bugs can you squash in 30 seconds?
          </p>
          <motion.div
            className="mx-auto mt-6 h-1 w-24 rounded-full bg-linear-to-r from-purple-500 to-cyan-500"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="mx-auto max-w-4xl">
          <div
            className="glass-card relative overflow-hidden rounded-3xl border border-purple-500/20 p-4 sm:p-6 md:p-8 dark:border-cyan-500/15"
            style={{
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.15), 0 20px 60px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              ref={gameAreaRef}
              className={`bug-game-area relative mx-auto h-[450px] w-full overflow-hidden rounded-2xl bg-linear-to-br from-purple-900/10 via-slate-900/5 to-cyan-900/10 md:h-[500px] lg:h-[600px] light:from-purple-100/40 light:to-cyan-50/30 ${
                gameState === "playing" ? "cursor-crosshair" : ""
              }`}
              role={gameState === "playing" ? "application" : undefined}
              aria-label="Bug catching game area"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-size-[40px_40px]"
                aria-hidden
              />

              <AnimatePresence mode="wait">
                {gameState === "start" && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
                  >
                    <div className="mb-6 text-7xl sm:text-8xl" aria-hidden>
                      🐛
                    </div>
                    <h3 className="font-space text-2xl font-bold text-gradient sm:text-3xl">Ready to Debug?</h3>
                    <p className="mt-3 max-w-md text-center text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                      Tap or click the bugs as fast as you can. You have 30 seconds — build combos for bonus points!
                    </p>
                    {highScore > 0 && (
                      <p className="mt-4 text-sm text-slate-500">
                        Your best:{" "}
                        <span className="font-bold text-purple-500 dark:text-purple-400">{highScore}</span> bugs
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startGame();
                      }}
                      data-lenis-prevent
                      className="relative z-40 mt-8 cursor-pointer rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-10 py-3.5 font-space text-lg font-bold text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 hover:shadow-purple-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      Start Game 🚀
                    </button>
                    <p className="mt-6 text-xs text-slate-500">Spacebar squashes nearest bug while playing</p>
                  </motion.div>
                )}

                {gameState === "playing" && (
                  <motion.div key="playing" className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="absolute top-0 right-0 left-0 z-10 h-1 bg-slate-800/40 dark:bg-slate-900/50">
                      <motion.div
                        className="h-full bg-linear-to-r from-purple-500 to-cyan-500"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.35, ease: "linear" }}
                      />
                    </div>

                    <div className="absolute top-4 left-4 z-10 glass-card rounded-full border border-white/15 px-5 py-2.5 light:border-slate-300/50">
                      <motion.p
                        key={score}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.25 }}
                        className="font-space text-3xl font-bold tabular-nums text-gradient sm:text-4xl md:text-5xl"
                        aria-live="polite"
                      >
                        {score}
                      </motion.p>
                    </div>

                    <div
                      className={`absolute top-4 right-4 z-10 glass-card rounded-full border border-white/15 px-5 py-2.5 light:border-slate-300/50 ${
                        isLowTime ? "animate-pulse" : ""
                      }`}
                    >
                      <p
                        className={`font-space text-xl font-bold tabular-nums sm:text-2xl ${
                          isCritical
                            ? "text-red-500"
                            : isLowTime
                              ? "text-amber-500"
                              : "text-emerald-500 dark:text-emerald-400"
                        }`}
                        aria-live="polite"
                      >
                        0:{timeLeft.toString().padStart(2, "0")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={endGame}
                      className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <SkipForward className="h-3.5 w-3.5" aria-hidden />
                      Skip
                    </button>

                    {bugs.map((bug) => (
                      <motion.button
                        key={bug.id}
                        type="button"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                        transition={{ scale: { type: "spring", stiffness: 400, damping: 22 } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          squashBug(bug.id, bug);
                        }}
                        className="absolute flex touch-manipulation items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-90"
                        style={{
                          left: bug.x,
                          top: bug.y,
                          width: bug.size + bugConfig.hitPad,
                          height: bug.size + bugConfig.hitPad,
                          marginLeft: -bugConfig.hitPad / 2,
                          marginTop: -bugConfig.hitPad / 2,
                          boxShadow: `0 0 24px ${bug.color}55, 0 4px 12px rgba(0,0,0,0.2)`,
                        }}
                        aria-label={`Squash ${bug.emoji} bug`}
                      >
                        <span
                          className="pointer-events-none text-2xl sm:text-3xl"
                          style={{
                            transform: `rotate(${Math.sin(bug.wiggle * 0.08) * 12}deg)`,
                          }}
                          aria-hidden
                        >
                          {bug.emoji}
                        </span>
                      </motion.button>
                    ))}

                    <AnimatePresence>
                      {particles.map((p) => (
                        <motion.span
                          key={p.id}
                          initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
                          animate={{
                            x: p.x + Math.cos(p.angle) * p.dist,
                            y: p.y + Math.sin(p.angle) * p.dist,
                            scale: 0,
                            opacity: 0,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="pointer-events-none absolute h-2 w-2 rounded-full"
                          style={{ backgroundColor: p.color, left: 0, top: 0 }}
                          aria-hidden
                        />
                      ))}
                    </AnimatePresence>

                    <AnimatePresence>
                      {scorePopups.map((popup) => (
                        <motion.span
                          key={popup.id}
                          initial={{ x: popup.x, y: popup.y, opacity: 1, scale: 1 }}
                          animate={{ y: popup.y - 48, opacity: 0, scale: 1.2 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8 }}
                          className="pointer-events-none absolute -translate-x-1/2 font-space text-lg font-bold text-cyan-400"
                          style={{ left: 0, top: 0 }}
                          aria-hidden
                        >
                          {popup.text}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {gameState === "gameover" && (
                  <motion.div
                    key="over"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
                  >
                    <div className="mb-4 text-6xl" aria-hidden>
                      🎉
                    </div>
                    <h3 className="font-space text-3xl font-bold text-gradient sm:text-4xl">Game Over!</h3>
                    <p className="mt-6 font-space text-6xl font-bold tabular-nums text-gradient sm:text-7xl">{score}</p>
                    <p className="mt-1 text-slate-500">Bugs Squashed</p>
                    <p className="mt-4 text-center text-lg text-cyan-600 dark:text-cyan-400">{getScoreMessage(score)}</p>

                    {newRecord && (
                      <p className="mt-3 animate-pulse text-sm font-semibold text-amber-500">🏆 New High Score! 🏆</p>
                    )}

                    {highScore > 0 && !isNewHighScore && (
                      <p className="mt-4 text-sm text-slate-500">
                        Your best: <span className="font-bold text-purple-500 dark:text-purple-400">{highScore}</span>
                      </p>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startGame();
                        }}
                        data-lenis-prevent
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-8 py-3 font-space font-semibold text-white transition-transform hover:scale-105"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden />
                        Play Again
                      </button>
                      <button
                        type="button"
                        onClick={shareScore}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-3 font-space font-semibold text-slate-800 transition-colors hover:border-purple-500/40 hover:bg-white/10 dark:text-white"
                      >
                        <Share2 className="h-4 w-4" aria-hidden />
                        {shareCopied ? "Copied!" : "Share Score"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              <Crosshair className="mr-1 inline h-4 w-4 align-text-bottom text-purple-500" aria-hidden />
              Tip: Bugs bounce off the edges — chain squashes for combo bonus points!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
