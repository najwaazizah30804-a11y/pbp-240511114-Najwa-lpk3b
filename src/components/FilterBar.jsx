import { FILTER_LIST } from "../utils/constants";

export default function FilterBar({ filter, onFilterChange }) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter daftar tugas">
      {FILTER_LIST.map((item) => {
        const active = filter === item.value;
        return (
          <button
            key={item.value}
            type="button"
            className={`filter-btn${active ? " active" : ""}`}
            aria-pressed={active}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
