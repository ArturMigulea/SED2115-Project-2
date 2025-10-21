import { useState } from "react";

const TABS = ["Calendar", "Today", "Goals"];

export default function TabBar({ initial = "Today", onChange }) {
  const [active, setActive] = useState(initial);

  const handleSelect = (name) => {
    setActive(name);
    onChange?.(name);
  };

  return (
    <nav className="tabbar" role="tablist" aria-label="Main">
      <div className="tabbar__circle" aria-hidden="true" />

      <ul className="tabbar__list">
        {TABS.map((name) => {
          const isActive = name === active;
          return (
            <li key={name} className="tabbar__item">
              <button
                role="tab"
                aria-selected={isActive}
                className={`tabbar__btn ${isActive ? "is-active" : ""}`}
                onClick={() => handleSelect(name)}
              >
                <span className="tabbar__label">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
