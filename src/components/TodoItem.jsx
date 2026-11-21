import { useEffect, useRef, useState } from "react";
import { Reorder, motion, useDragControls, useReducedMotion } from "framer-motion";
import { PRIORITAS_META } from "../utils/constants";

export default function TodoItem({
  todo,
  canReorder,
  onHapus,
  onToggle,
  onEdit,
  onMoveByStep
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.teks);
  const inputRef = useRef(null);
  const dragControls = useDragControls();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setDraft(todo.teks);
    setIsEditing(true);
  };

  const commitEdit = () => {
    const clean = draft.trim();
    setIsEditing(false);
    if (clean && clean !== todo.teks) {
      onEdit(todo.id, clean);
    } else {
      setDraft(todo.teks);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(todo.teks);
  };

  const handleKeyReorder = (e) => {
    if (!canReorder) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const delta = e.key === "ArrowUp" ? -1 : 1;
      onMoveByStep(todo.id, delta);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-handle-id="${todo.id}"]`);
        if (el) el.focus();
      });
    }
  };

  const pMeta = PRIORITAS_META[todo.prioritas] || PRIORITAS_META.biasa;

  const content = (
    <>
      {canReorder && (
        <button
          type="button"
          className="drag-handle"
          data-handle-id={todo.id}
          aria-label={`Urutkan tugas "${todo.teks}", tekan panah atas atau bawah`}
          title="Seret atau tekan Panah Atas/Bawah untuk ubah urutan"
          onPointerDown={(e) => dragControls.start(e)}
          onKeyDown={handleKeyReorder}
        >
          ⠿
        </button>
      )}

      <input
        type="checkbox"
        className="todo-check"
        checked={todo.selesai}
        onChange={() => onToggle(todo.id)}
        aria-label={`Tandai "${todo.teks}" ${todo.selesai ? "belum selesai" : "selesai"}`}
      />

      <div className="todo-body">
        <div className="todo-meta">
          <span className={`sticker-tag ${pMeta.className}`}>{pMeta.label}</span>
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="edit-input"
            value={draft}
            maxLength={140}
            aria-label="Edit teks tugas"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
          />
        ) : (
          <span
            className="teks"
            title="Klik ganda untuk mengedit"
            onDoubleClick={startEdit}
          >
            {todo.teks}
          </span>
        )}
      </div>

      <div className="item-actions">
        <button
          type="button"
          className="edit-btn"
          onClick={startEdit}
          title="Edit tugas"
          aria-label={`Edit tugas "${todo.teks}"`}
        >
          ✏️
        </button>
        <button
          type="button"
          className="hapus"
          onClick={() => onHapus(todo.id)}
          aria-label={`Hapus tugas "${todo.teks}"`}
        >
          Hapus
        </button>
      </div>
    </>
  );

  const motionProps = {
    className: todo.selesai ? "selesai" : "",
    "data-prioritas": todo.prioritas || "biasa",
    initial: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 },
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] }
  };

  if (canReorder) {
    return (
      <Reorder.Item
        value={todo}
        dragListener={false}
        dragControls={dragControls}
        layout={reduced ? false : "position"}
        {...motionProps}
      >
        {content}
      </Reorder.Item>
    );
  }

  return (
    <motion.li layout={!reduced} {...motionProps}>
      {content}
    </motion.li>
  );
}
