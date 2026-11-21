export const STORAGE_KEY = "todos";
export const MUTE_KEY = "todos-muted";

export const PRIORITAS_META = {
  penting: { label: "🔥 Penting", className: "sticker-penting" },
  biasa: { label: "⭐ Biasa", className: "sticker-biasa" },
  santai: { label: "🌱 Santai", className: "sticker-santai" }
};

export const PRIORITAS_LIST = [
  { value: "penting", label: "🔥 Penting", className: "priority-penting" },
  { value: "biasa", label: "⭐ Biasa", className: "priority-biasa" },
  { value: "santai", label: "🌱 Santai", className: "priority-santai" }
];

export const FILTER_LIST = [
  { value: "semua", label: "Semua" },
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" }
];

export const ENCOURAGEMENTS = [
  "Semangat, Najwa! 💪",
  "Satu langkah kecil tiap hari itu keren ✨",
  "Mochi bangga sama progresmu! 🐾",
  "Pelan-pelan tapi pasti beres 🌸",
  "Jangan lupa minum air dulu ya 🍓"
];

export function muatTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      id: Number(item.id) || Date.now() + idx,
      teks: String(item.teks ?? ""),
      selesai: Boolean(item.selesai),
      prioritas: ["penting", "biasa", "santai"].includes(item.prioritas)
        ? item.prioritas
        : "biasa"
    }));
  } catch {
    return [];
  }
}
