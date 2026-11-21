import { useState } from "react";
import { PRIORITAS_LIST } from "../utils/constants";

export default function TodoForm({ onTambah }) {
  const [teks, setTeks] = useState("");
  const [prioritas, setPrioritas] = useState("biasa");

  const submit = (e) => {
    e.preventDefault();
    if (teks.trim()) {
      onTambah(teks.trim(), prioritas);
      setTeks("");
    }
  };

  return (
    <form onSubmit={submit} className="form" id="form-todo" autoComplete="off">
      <div className="input-row">
        <label htmlFor="input-todo" className="sr-only">
          Tulis tugas baru
        </label>
        <input
          id="input-todo"
          type="text"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Tulis tugas baru..."
          maxLength={140}
          required
        />
        <button type="submit" className="btn-primary">
          Tambah
        </button>
      </div>

      <fieldset className="priority-group">
        <legend className="sr-only">Pilih prioritas tugas</legend>
        <span className="priority-title">Prioritas:</span>
        {PRIORITAS_LIST.map((item) => (
          <label key={item.value} className={`priority-pill ${item.className}`}>
            <input
              type="radio"
              name="prioritas"
              value={item.value}
              checked={prioritas === item.value}
              onChange={() => setPrioritas(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
    </form>
  );
}
