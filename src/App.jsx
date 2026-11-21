import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import TodoForm from "./components/TodoForm";
import TodoStats from "./components/TodoStats";
import TodoList from "./components/TodoList";
import FilterBar from "./components/FilterBar";
import { ENCOURAGEMENTS, MUTE_KEY, STORAGE_KEY, muatTodos } from "./utils/constants";
import { triggerConfetti } from "./utils/confetti";
import { playPopSound } from "./utils/sound";

const Mascot3D = lazy(() => import("./components/Mascot3D"));

function MascotFallback() {
  return (
    <div className="mascot-fallback" aria-hidden="true">
      <div className="fallback-cat">🐱</div>
      <span className="fallback-shadow" />
    </div>
  );
}

export default function App() {
  // Menggunakan lazy initializer agar React.StrictMode double-mount tidak menimpa data localStorage
  const [todos, setTodos] = useState(() => muatTodos());
  const [filter, setFilter] = useState("semua");
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === "true");
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [pokeKey, setPokeKey] = useState(0);
  const [pokeMessage, setPokeMessage] = useState("");
  const pokeTimerRef = useRef(null);
  const cardRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    return () => {
      if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
    };
  }, []);

  const tambah = (teks, prioritas = "biasa") => {
    const clean = teks.trim();
    if (!clean) return;
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 100),
        teks: clean,
        selesai: false,
        prioritas
      }
    ]);
  };

  const hapus = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggle = (id) => {
    const target = todos.find((t) => t.id === id);
    const jadiSelesai = target ? !target.selesai : false;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t))
    );

    if (jadiSelesai) {
      if (!muted) playPopSound();
      triggerConfetti();
      setCelebrateKey((k) => k + 1);
    }
  };

  const edit = (id, teksBaru) => {
    const clean = teksBaru.trim();
    if (!clean) return;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, teks: clean } : t))
    );
  };

  const hapusSelesai = () => {
    setTodos((prev) => prev.filter((t) => !t.selesai));
  };

  const urutkan = (newOrder) => {
    setTodos(newOrder);
  };

  const moveByStep = (id, delta) => {
    setTodos((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const nextIdx = idx + delta;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const handlePoke = () => {
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setPokeMessage(msg);
    setPokeKey((k) => k + 1);
    if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = setTimeout(() => setPokeMessage(""), 2800);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (!nextMuted) playPopSound();
  };

  const visibleTodos = useMemo(() => {
    if (filter === "aktif") return todos.filter((t) => !t.selesai);
    if (filter === "selesai") return todos.filter((t) => t.selesai);
    return todos;
  }, [todos, filter]);

  const total = todos.length;
  const selesai = todos.filter((t) => t.selesai).length;
  const belum = total - selesai;
  const progress = total === 0 ? 0 : selesai / total;
  const pct = Math.round(progress * 100);

  const mood = total === 0 ? "empty" : belum === 0 ? "happy" : "busy";
  const moodLabel =
    mood === "empty"
      ? "Lagi Sepi 😿"
      : mood === "happy"
      ? "Hore! Beres 🌸"
      : "Semangat! 🐾";

  const defaultBubble =
    mood === "empty"
      ? "Belum ada tugas nih, Najwa! Yuk tambah satu 🐾"
      : mood === "happy"
      ? "Yeay! Semua tugas selesai, Najwa hebat! 🌟"
      : `Ada ${belum} tugas lagi! Kamu pasti bisa 💪`;

  const handleCardPointerMove = (e) => {
    if (
      reduced ||
      !cardRef.current ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    cardRef.current.style.transform = `rotateX(${(-ny * 3.2).toFixed(2)}deg) rotateY(${(nx * 3.2).toFixed(2)}deg)`;
  };

  const handleCardPointerLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <>
      <div className="bg-decor" aria-hidden="true">
        <span className="blob blob-pink" />
        <span className="blob blob-lilac" />
        <span className="blob blob-mint" />
        <span className="floater floater-1">✦</span>
        <span className="floater floater-2">♡</span>
        <span className="floater floater-3">★</span>
        <span className="floater floater-4">✿</span>
      </div>

      <div className="page-shell">
        <aside className="mascot-panel" aria-label="Panggung Maskot Mochi 3D">
          <div className="mascot-header">
            <span className="mascot-name">Mochi Companion</span>
            <span className="mood-badge" data-mood={mood}>
              {moodLabel}
            </span>
          </div>

          <div className="mascot-bubble" aria-live="polite">
            {pokeMessage || defaultBubble}
          </div>

          <div
            className="mascot-stage"
            role="button"
            tabIndex={0}
            aria-label="Maskot kucing Mochi 3D. Klik atau tekan Enter untuk pesan penyemangat"
            onClick={handlePoke}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePoke();
              }
            }}
          >
            <Suspense fallback={<MascotFallback />}>
              <Mascot3D
                mood={mood}
                progress={progress}
                celebrateKey={celebrateKey}
                pokeKey={pokeKey}
              />
            </Suspense>
          </div>

          <div className="progress-card">
            <div className="progress-row">
              <span className="progress-label">Progres Harian</span>
              <span className="progress-text">
                {pct}% selesai ({selesai}/{total})
              </span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="mascot-hint">
              Klik Mochi untuk semangat · Arahkan kursor agar Mochi menoleh
            </p>
          </div>
        </aside>

        <main
          ref={cardRef}
          className="app"
          onPointerMove={handleCardPointerMove}
          onPointerLeave={handleCardPointerLeave}
        >
          <header className="app-header">
            <div className="title-wrap">
              <h1>📝 To-Do List React</h1>
              <p className="subtitle">
                Daftar tugas manis &amp; interaktif · React 3D Hooks
              </p>
            </div>
            <button
              type="button"
              className="icon-btn mute-btn"
              aria-label={muted ? "Nyalakan suara efek" : "Matikan suara efek"}
              aria-pressed={muted}
              title={muted ? "Suara efek dimatikan" : "Suara efek aktif"}
              onClick={toggleMute}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </header>

          <TodoForm onTambah={tambah} />
          <TodoStats todos={todos} onHapusSelesai={hapusSelesai} />
          <FilterBar filter={filter} onFilterChange={setFilter} />
          <TodoList
            todos={todos}
            visibleTodos={visibleTodos}
            filter={filter}
            onHapus={hapus}
            onToggle={toggle}
            onEdit={edit}
            onUrutkan={urutkan}
            onMoveByStep={moveByStep}
          />

          <p className="tip-line">
            Tip: Klik ganda atau tekan ✏️ untuk edit · Seret ⠿ untuk ubah urutan
          </p>
        </main>
      </div>

      <footer className="site-footer">
        <span>
          Najwa Azizah · 240511114 · TI24D — Pemrograman Berbasis Platform (LKP 3B)
        </span>
      </footer>
    </>
  );
}
