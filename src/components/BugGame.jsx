import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Crosshair, RotateCcw, SkipForward } from "lucide-react";

import { useVisitorTracking } from "@/hooks/useVisitorTracking";



const GAME_DURATION = 30;

const PLAYER_NAME_SESSION_KEY = "bugGamePlayerName";

const COMBO_WINDOW_MS = 1500;



const BUG_COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6"];

const BUG_EMOJIS = ["🐛", "🐞", "🦟", "🪲"];



const SCORE_MESSAGES = [

  { max: 5, text: "Just getting started! 🐛" },

  { max: 20, text: "Not bad for a human! 😊" },

  { max: 35, text: "Bug Hunter! 🎯" },

  { max: 50, text: "Senior Debugger! 🔥" },

  { max: 70, text: "Legendary Developer! ⭐" },

  { max: 85, text: "Master of Bugs! 🤯" },

  { max: 100, text: "Superhuman! 💯" },

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



function randomVelocity(speed = 3.8) {
  const angle = Math.random() * Math.PI * 2;
  const mag = speed * (0.75 + Math.random() * 0.65);
  return {
    vx: Math.cos(angle) * mag,
    vy: Math.sin(angle) * mag,
  };
}



function createBug(id, bounds, size) {

  const maxX = Math.max(0, bounds.width - size);

  const maxY = Math.max(0, bounds.height - size);

  const speed = 3.4 + Math.random() * 3.2;



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



function GameButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`contact-form-submit relative z-50 w-full cursor-pointer font-space font-semibold transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function syncBugNodes(bugs, nodeRefs, hitPad) {
  const pad = hitPad / 2;
  const liveIds = new Set(bugs.map((b) => b.id));
  for (const id of nodeRefs.keys()) {
    if (!liveIds.has(id)) nodeRefs.delete(id);
  }
  bugs.forEach((bug) => {
    const el = nodeRefs.get(bug.id);
    if (el) {
      el.style.transform = `translate3d(${bug.x - pad}px, ${bug.y - pad}px, 0)`;
    }
  });
}

function BugSprites({ bugs, hitPad, nodeRefsRef }) {
  const nodeRefs = nodeRefsRef.current;
  return bugs.map((bug) => (
    <div
      key={bug.id}
      ref={(el) => {
        if (!el) {
          nodeRefs.delete(bug.id);
          return;
        }
        nodeRefs.set(bug.id, el);
      }}
      className="bug-sprite pointer-events-none absolute left-0 top-0 z-20 flex select-none items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md"
      style={{
        width: bug.size + hitPad,
        height: bug.size + hitPad,
        willChange: "transform",
        boxShadow: `0 0 24px ${bug.color}55, 0 4px 12px rgba(0,0,0,0.2)`,
      }}
      aria-hidden
    >
      <span
        data-bug-emoji
        className="pointer-events-none select-none text-2xl sm:text-3xl"
      >
        {bug.emoji}
      </span>
    </div>
  ));
}




export default function BugGame() {

  const { trackGamePlayed } = useVisitorTracking();



  const [gameState, setGameState] = useState("start");

  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const [bugs, setBugs] = useState([]);

  const [particles, setParticles] = useState([]);

  const [scorePopups, setScorePopups] = useState([]);

  const [personalBest, setPersonalBest] = useState(null);

  const [newRecord, setNewRecord] = useState(false);

  const [bounds, setBounds] = useState({ width: 900, height: 600 });

  const [bugConfig, setBugConfig] = useState(() => getBugConfig(900));



  const [playerName, setPlayerName] = useState("");

  const [nameError, setNameError] = useState("");

  const [isSavingScore, setIsSavingScore] = useState(false);

  const [leaderboard, setLeaderboardData] = useState([]);

  const [leaderboardStats, setLeaderboardStats] = useState({});

  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const [playerRankPosition, setPlayerRankPosition] = useState(null);



  const gameAreaRef = useRef(null);
  const bugNodeRefs = useRef(new Map());
  const bugIdSeq = useRef(0);

  const rafRef = useRef(null);

  const bugsRef = useRef([]);

  const comboRef = useRef(0);

  const lastSquashRef = useRef(0);

  const scoreRef = useRef(0);

  const gameStateRef = useRef("start");

  const boundsRef = useRef(bounds);

  const bugConfigRef = useRef(bugConfig);

  const personalBestRef = useRef(null);



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
    personalBestRef.current = personalBest;
  }, [personalBest]);

  const fetchLeaderboard = useCallback(async (name) => {
    setIsLoadingLeaderboard(true);
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (name?.trim()) params.set("playerName", name.trim());

      const response = await fetch(`/api/game?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboardData(data.data.leaderboard);
        setLeaderboardStats(data.data.stats);
        if (data.data.stats.personalBest != null) {
          setPersonalBest(data.data.stats.personalBest);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    const savedName = sessionStorage.getItem(PLAYER_NAME_SESSION_KEY);
    if (savedName) {
      setPlayerName(savedName);
      fetchLeaderboard(savedName);
    } else {
      fetchLeaderboard();
    }
  }, [fetchLeaderboard]);



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

  const makeBugId = useCallback(() => {
    bugIdSeq.current += 1;
    return `bug-${bugIdSeq.current}`;
  }, []);

  useLayoutEffect(() => {
    if (gameState !== "playing") return;
    syncBugNodes(bugsRef.current, bugNodeRefs.current, bugConfigRef.current.hitPad);
  }, [bugs, gameState]);

  const spawnBugs = useCallback((count) => {

    const b = boundsRef.current;

    const cfg = bugConfigRef.current;

    const list = Array.from({ length: count }, () =>
      createBug(makeBugId(), b, cfg.size)
    );

    setBugs(list);

    bugsRef.current = list;

  }, [makeBugId]);

  const startGame = useCallback(() => {
    bugIdSeq.current = 0;
    comboRef.current = 0;

    lastSquashRef.current = 0;

    setScore(0);

    scoreRef.current = 0;

    setTimeLeft(GAME_DURATION);

    setParticles([]);

    setScorePopups([]);

    setNewRecord(false);

    setBugs([]);
    bugsRef.current = [];
    bugNodeRefs.current.clear();

    setPlayerName("");

    setNameError("");

    setPlayerRankPosition(null);

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
    bugNodeRefs.current.clear();



    const final = scoreRef.current;
    const previousBest = personalBestRef.current;

    setNewRecord(
      previousBest !== null && final > previousBest
    );



    trackGamePlayed();

  }, [trackGamePlayed]);



  const goToNameEntry = () => {

    setGameState("enterName");

    gameStateRef.current = "enterName";

  };



  const submitScore = async () => {

    if (!playerName.trim()) {

      setNameError("Please enter your name");

      return;

    }

    if (playerName.trim().length < 2) {

      setNameError("Name must be at least 2 characters");

      return;

    }

    if (playerName.trim().length > 20) {

      setNameError("Name must be 20 characters or less");

      return;

    }



    setIsSavingScore(true);

    setNameError("");



    try {

      const response = await fetch("/api/game", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          playerName: playerName.trim(),

          score,

          bugsSquashed: score,

          timeSpent: GAME_DURATION,

        }),

      });



      const data = await response.json();



      if (data.success) {
        const name = playerName.trim();
        sessionStorage.setItem(PLAYER_NAME_SESSION_KEY, name);
        setPlayerRankPosition(data.data.rankPosition);
        if (data.data.personalBest != null) {
          setPersonalBest(data.data.personalBest);
        }
        await fetchLeaderboard(name);
        setGameState("leaderboard");

        gameStateRef.current = "leaderboard";

      } else {

        setNameError(data.error || "Failed to save score. Try again.");

      }

    } catch {

      setNameError("Network error. Score not saved.");

    } finally {

      setIsSavingScore(false);

    }

  };



  const skipAndShowLeaderboard = async () => {
    const name = playerName.trim() || sessionStorage.getItem(PLAYER_NAME_SESSION_KEY);
    await fetchLeaderboard(name || undefined);
    setGameState("leaderboard");

    gameStateRef.current = "leaderboard";

  };



  const openLeaderboard = async () => {
    const name = playerName.trim() || sessionStorage.getItem(PLAYER_NAME_SESSION_KEY);
    await fetchLeaderboard(name || undefined);
    setGameState("leaderboard");

    gameStateRef.current = "leaderboard";

  };



  const goHome = () => {

    setGameState("start");

    gameStateRef.current = "start";

    setPlayerRankPosition(null);

  };



  useEffect(() => {

    if (gameState !== "playing") return undefined;



    const tick = () => {
      const b = boundsRef.current;
      const cfg = bugConfigRef.current;
      const size = cfg.size;
      const pad = cfg.hitPad / 2;

      bugsRef.current = bugsRef.current.map((bug) => {
        let { x, y, vx, vy } = bug;

        const maxX = b.width - size;
        const maxY = b.height - size;

        if (Math.random() < 0.04) {
          vx += (Math.random() - 0.5) * 0.65;
          vy += (Math.random() - 0.5) * 0.65;
          const maxSpeed = 7.5;
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

        const next = {
          ...bug,
          x,
          y,
          vx,
          vy,
          wiggle: bug.wiggle + 4,
        };

        const el = bugNodeRefs.current.get(bug.id);
        if (el) {
          el.style.transform = `translate3d(${x - pad}px, ${y - pad}px, 0)`;
          const emoji = el.querySelector("[data-bug-emoji]");
          if (emoji) {
            emoji.style.transform = `rotate(${Math.sin(next.wiggle * 0.08) * 12}deg)`;
          }
        }

        return next;
      });

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
    (bugId) => {
      if (gameStateRef.current !== "playing") return;

      const bug = bugsRef.current.find((b) => b.id === bugId);
      if (!bug) return;

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
        const next = bugsRef.current.filter((b) => b.id !== bugId);
        bugsRef.current = next;
        bugNodeRefs.current.delete(bugId);
        return [...next];
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

        const newBug = createBug(makeBugId(), boundsRef.current, cfg.size);
        const next = [...bugsRef.current, newBug];
        bugsRef.current = next;
        setBugs([...next]);

      }, 60);

    },

    [createParticles, makeBugId]

  );

  const handleGamePointerDown = useCallback(
    (e) => {
      if (gameStateRef.current !== "playing") return;
      if (e.target.closest("[data-game-ui]")) return;

      e.preventDefault();

      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const cfg = bugConfigRef.current;
      const hitSize = cfg.size + cfg.hitPad;
      const half = cfg.hitPad / 2;

      for (let i = bugsRef.current.length - 1; i >= 0; i--) {
        const bug = bugsRef.current[i];
        const bx = bug.x - half;
        const by = bug.y - half;
        if (px >= bx && px <= bx + hitSize && py >= by && py <= by + hitSize) {
          squashBug(bug.id);
          return;
        }
      }
    },
    [squashBug]
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

    squashBug(nearest.id);

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



  const progress = (timeLeft / GAME_DURATION) * 100;

  const isLowTime = timeLeft <= 10;

  const isCritical = timeLeft <= 5;

  const trimmedPlayerName = playerName.trim();



  return (

    <section
      id="bug-game"
      className="bug-game-viewport relative scroll-mt-24 flex flex-col overflow-hidden"
      aria-labelledby="bug-game-title"
    >

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>

        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px]" />

        <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]" />

      </div>



      <div className="home-container flex h-full min-h-0 flex-1 flex-col py-3 sm:py-4">

        <header className="mb-3 shrink-0 text-center md:mb-4">

          <h2 id="bug-game-title" className="font-space text-3xl font-bold text-gradient sm:text-4xl">

            Debug Challenge

          </h2>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 md:text-base">

            How many bugs can you squash in 30 seconds?

          </p>

          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-purple-500 to-cyan-500" />
        </header>



        <div className="glass-card glass-card--lg glass-card--static bug-game-panel pointer-events-auto relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-5">

            <div

              ref={gameAreaRef}

              onPointerDown={handleGamePointerDown}

              className={`bug-game-area relative mx-auto min-h-[12rem] w-full min-w-0 flex-1 overflow-hidden rounded-2xl bg-linear-to-br from-purple-900/10 via-slate-900/5 to-cyan-900/10 light:from-purple-100/40 light:to-cyan-50/30 ${
                gameState === "playing" ? "cursor-crosshair select-none touch-none" : ""
              }`}

              role={gameState === "playing" ? "application" : undefined}

              aria-label="Bug catching game area"

            >

              <div

                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-size-[40px_40px]"

                aria-hidden

              />



              {gameState === "start" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 overflow-y-auto p-4 sm:p-6"
                >
                  <div className="text-5xl sm:text-6xl animate-bounce" aria-hidden>
                    🐛
                  </div>

                  {leaderboardStats.totalPlayers > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 text-center sm:gap-3">

                      <div className="glass-card rounded-full border border-white/10 px-4 py-2 text-sm light:border-slate-300/60">

                        👥 {leaderboardStats.totalPlayers} Players

                      </div>

                      <div className="glass-card rounded-full border border-white/10 px-4 py-2 text-sm light:border-slate-300/60">

                        🏆 Best: {leaderboardStats.highestScore}

                      </div>

                      <div className="glass-card rounded-full border border-white/10 px-4 py-2 text-sm light:border-slate-300/60">

                        📊 Avg: {leaderboardStats.averageScore}

                      </div>

                    </div>

                  )}



                  {personalBest != null && personalBest > 0 && (
                    <p className="text-sm text-slate-500">
                      Your best:{" "}
                      <span className="font-bold text-purple-500 dark:text-purple-400">{personalBest}</span> bugs
                    </p>
                  )}

                  <div className="flex w-full max-w-xs flex-col gap-3">

                    <GameButton

                      id="bug-game-start"

                      onClick={startGame}

                      className="rounded-xl bg-linear-to-r from-purple-600 to-blue-600 py-4 text-lg text-white shadow-lg shadow-purple-500/30"

                    >

                      Start Game 🚀

                    </GameButton>

                    <GameButton

                      onClick={openLeaderboard}

                      className="rounded-xl border border-white/20 bg-white/5 py-3 text-sm light:border-slate-300/60 light:text-slate-800"

                    >

                      🏆 View Leaderboard

                    </GameButton>

                  </div>

                  <p className="text-xs text-slate-500">Spacebar squashes nearest bug while playing</p>
                </motion.div>
              )}



              <AnimatePresence>

                {gameState === "playing" && (

                  <motion.div

                    key="playing"

                    className="absolute inset-0 z-10"

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                  >

                    <div className="absolute top-0 right-0 left-0 z-10 h-1 bg-slate-800/40 dark:bg-slate-900/50">

                      <motion.div

                        className="h-full bg-linear-to-r from-purple-500 to-cyan-500"

                        initial={false}

                        animate={{ width: `${progress}%` }}

                        transition={{ duration: 0.35, ease: "linear" }}

                      />

                    </div>



                    <div className="absolute top-4 left-4 z-30 glass-card rounded-full border border-white/15 px-5 py-2.5 light:border-slate-300/50" data-game-ui>

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
                      data-game-ui
                      className={`absolute top-4 right-4 z-30 glass-card rounded-full border border-white/15 px-5 py-2.5 light:border-slate-300/50 ${

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

                      className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-300"
                      data-game-ui

                    >

                      <SkipForward className="h-3.5 w-3.5" aria-hidden />

                      Skip

                    </button>



                    <BugSprites
                      bugs={bugs}
                      hitPad={bugConfig.hitPad}
                      nodeRefsRef={bugNodeRefs}
                    />



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

              </AnimatePresence>



              {gameState === "gameover" && (

                <motion.div

                  initial={{ opacity: 0, scale: 0.9 }}

                  animate={{ opacity: 1, scale: 1 }}

                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 p-8 light:bg-white/50"

                >

                  <div className="mb-4 text-6xl sm:text-7xl" aria-hidden>

                    🎉

                  </div>

                  <h3 className="font-space text-3xl font-bold text-gradient sm:text-4xl">Time&apos;s Up!</h3>

                  <div className="mt-2 font-space text-5xl font-bold tabular-nums text-gradient sm:text-6xl">{score}</div>

                  <p className="mt-1 text-slate-500">Bugs Squashed</p>

                  <p className="mt-3 text-lg text-cyan-600 dark:text-cyan-400">{getScoreMessage(score)}</p>



                  {newRecord && (
                    <p className="mt-3 animate-pulse text-sm font-semibold text-amber-500">
                      🏆 New Personal Best!
                    </p>
                  )}

                  {personalBest != null && !newRecord && score <= personalBest && (
                    <p className="mt-3 text-sm text-slate-500">
                      Your best:{" "}
                      <span className="font-bold text-purple-500 dark:text-purple-400">{personalBest}</span>
                    </p>
                  )}



                  <div className="mt-6 flex w-full max-w-xs flex-col gap-3">

                    <GameButton

                      onClick={goToNameEntry}

                      className="rounded-xl bg-linear-to-r from-purple-600 to-blue-600 py-4 text-white"

                    >

                      🏆 Save to Leaderboard

                    </GameButton>

                    <GameButton

                      onClick={skipAndShowLeaderboard}

                      className="rounded-xl border border-white/20 bg-white/5 py-3 text-sm light:border-slate-300/60"

                    >

                      📊 View Leaderboard

                    </GameButton>

                    <GameButton

                      onClick={startGame}

                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-sm light:border-slate-300/60"

                    >

                      <RotateCcw className="h-4 w-4" aria-hidden />

                      Play Again

                    </GameButton>

                  </div>

                </motion.div>

              )}



              {gameState === "enterName" && (

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/50 p-8 light:bg-white/60"

                >

                  <div className="mb-4 text-5xl" aria-hidden>

                    ✍️

                  </div>

                  <h3 className="font-space text-2xl font-bold text-gradient sm:text-3xl">Enter Your Name</h3>

                  <p className="mt-2 text-center text-slate-600 dark:text-slate-400">

                    You scored{" "}

                    <span className="font-bold text-cyan-500 dark:text-cyan-400">{score}</span> bugs!

                  </p>

                  <p className="mb-6 text-center text-sm text-slate-500">

                    Save your score to the global leaderboard

                  </p>



                  <div className="w-full max-w-sm">

                    <input

                      type="text"

                      value={playerName}

                      onChange={(e) => {

                        setPlayerName(e.target.value);

                        setNameError("");

                      }}

                      onKeyDown={(e) => e.key === "Enter" && submitScore()}

                      placeholder="Your name or nickname..."

                      maxLength={20}

                      autoFocus

                      className={`w-full rounded-xl border bg-white/5 px-6 py-4 text-center text-lg font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-white light:bg-white/90 ${

                        nameError ? "border-red-500" : "border-white/10 light:border-slate-300/60"

                      } focus:border-purple-500`}

                    />



                    <div className="mb-4 mt-2 flex items-center justify-between">

                      {nameError ? (

                        <p className="text-sm text-red-400">{nameError}</p>

                      ) : (

                        <span />

                      )}

                      <p className="ml-auto text-xs text-slate-500">{playerName.length}/20</p>

                    </div>



                    <div className="flex flex-col gap-3">

                      <GameButton

                        onClick={submitScore}

                        disabled={isSavingScore}

                        className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 py-4 text-white"

                      >

                        {isSavingScore ? (

                          <>

                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                            Saving...

                          </>

                        ) : (

                          "🚀 Submit Score"

                        )}

                      </GameButton>

                      <GameButton

                        onClick={() => {

                          setGameState("gameover");

                          gameStateRef.current = "gameover";

                        }}

                        className="rounded-xl border border-white/20 bg-white/5 py-3 text-sm light:border-slate-300/60"

                      >

                        ← Back

                      </GameButton>

                    </div>

                  </div>

                </motion.div>

              )}



              {gameState === "leaderboard" && (

                <motion.div

                  initial={{ opacity: 0 }}

                  animate={{ opacity: 1 }}

                  className="absolute inset-0 z-20 flex flex-col bg-slate-950/50 p-6 light:bg-white/70"

                >

                  <div className="mb-4 text-center">

                    <h3 className="font-space text-2xl font-bold text-gradient">🏆 Global Leaderboard</h3>

                    {playerRankPosition && (

                      <p className="mt-1 text-sm text-cyan-500 dark:text-cyan-400">

                        You ranked #{playerRankPosition} globally!

                      </p>

                    )}

                    {leaderboardStats.totalPlayers > 0 && (

                      <p className="mt-1 text-xs text-slate-500">

                        {leaderboardStats.totalPlayers} players • Avg: {leaderboardStats.averageScore} • Best:{" "}

                        {leaderboardStats.highestScore}

                      </p>

                    )}

                  </div>



                  {isLoadingLeaderboard ? (

                    <div className="flex flex-1 items-center justify-center">

                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />

                    </div>

                  ) : (

                    <div className="mb-4 flex-1 space-y-2 overflow-y-auto">

                      {leaderboard.length === 0 ? (

                        <div className="py-8 text-center text-slate-500">No scores yet. Be the first! 🐛</div>

                      ) : (

                        leaderboard.map((entry, index) => {

                          const isYou =

                            trimmedPlayerName &&

                            entry.playerName.toLowerCase() === trimmedPlayerName.toLowerCase();



                          return (

                            <motion.div

                              key={`${entry.playerName}-${entry.score}-${index}`}

                              initial={{ opacity: 0, x: -20 }}

                              animate={{ opacity: 1, x: 0 }}

                              transition={{ delay: index * 0.05 }}

                              className={`glass-card flex items-center gap-3 rounded-xl px-4 py-3 ${

                                isYou ? "border border-purple-500/50 bg-purple-500/10" : ""

                              }`}

                            >

                              <div className="w-8 shrink-0 text-center text-lg font-bold">

                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2 truncate font-semibold text-slate-900 dark:text-white">

                                  {entry.playerName}

                                  {isYou && <span className="text-xs text-purple-400">(you)</span>}

                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500">

                                  <span>{entry.badge}</span>

                                  {entry.location && entry.location !== "Unknown" && (

                                    <span>• 📍 {entry.location}</span>

                                  )}

                                </div>

                              </div>

                              <div className="shrink-0 text-right">

                                <div className="font-space text-xl font-bold text-gradient">{entry.score}</div>

                                <div className="text-xs text-slate-500">bugs</div>

                              </div>

                            </motion.div>

                          );

                        })

                      )}

                    </div>

                  )}



                  <div className="shrink-0">
                    <GameButton
                      onClick={goHome}
                      className="w-full rounded-xl border border-white/20 bg-white/5 py-3 text-sm light:border-slate-300/60"
                    >
                      🏠 Home
                    </GameButton>
                  </div>

                </motion.div>

              )}

            </div>



            {gameState === "playing" && (
            <p className="mt-2 shrink-0 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              <Crosshair className="mr-1 inline h-4 w-4 align-text-bottom text-purple-500" aria-hidden />
              Tip: Bugs bounce off the edges — chain squashes for combo bonus points!
            </p>
            )}

          </div>

      </div>

    </section>

  );

}


