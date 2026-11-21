export default function TodoStats({ todos, onHapusSelesai }) {
  const selesai = todos.filter((t) => t.selesai).length;
  const belum = todos.length - selesai;

  return (
    <div className="toolbar-row">
      <p id="stats" className="stats" aria-live="polite">
        {belum} tugas belum selesai
      </p>
      <button
        type="button"
        className="btn-clear"
        onClick={onHapusSelesai}
        disabled={selesai === 0}
      >
        Hapus yang selesai ({selesai})
      </button>
    </div>
  );
}
