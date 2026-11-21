import { AnimatePresence, Reorder, motion } from "framer-motion";
import TodoItem from "./TodoItem";

export default function TodoList({
  todos,
  visibleTodos,
  filter,
  onHapus,
  onToggle,
  onEdit,
  onUrutkan,
  onMoveByStep
}) {
  if (todos.length === 0) {
    return (
      <ul className="list" id="list-todo" aria-label="Daftar tugas">
        <li className="empty-state">
          <span className="teks">Belum ada tugas. Tambahkan! 🐾</span>
        </li>
      </ul>
    );
  }

  if (visibleTodos.length === 0) {
    return (
      <ul className="list" id="list-todo" aria-label="Daftar tugas">
        <li className="empty-state">
          <span className="teks">
            {filter === "aktif"
              ? "Semua tugas sudah beres! Keren 🎉"
              : "Belum ada tugas yang selesai nih 🌸"}
          </span>
        </li>
      </ul>
    );
  }

  if (filter === "semua") {
    return (
      <Reorder.Group
        axis="y"
        values={todos}
        onReorder={onUrutkan}
        className="list"
        id="list-todo"
        aria-label="Daftar tugas"
      >
        <AnimatePresence initial={false}>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              canReorder
              onHapus={onHapus}
              onToggle={onToggle}
              onEdit={onEdit}
              onMoveByStep={onMoveByStep}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    );
  }

  return (
    <motion.ul key={filter} className="list" id="list-todo" aria-label="Daftar tugas">
      <AnimatePresence initial={false}>
        {visibleTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            canReorder={false}
            onHapus={onHapus}
            onToggle={onToggle}
            onEdit={onEdit}
            onMoveByStep={onMoveByStep}
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
