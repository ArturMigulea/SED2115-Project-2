import styles from "./PlayersPage.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { players } from "../../data/players";

export default function PlayersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);

  const topPlayers = players.slice(0, 15);

  function handleSearch() {
    if (!search.trim()) return alert("Type NBA Player");

    const term = search.toLowerCase();

    const player = players.find(
      p => p.name.toLowerCase().includes(term)
    );
    if (player) {
      navigate(`/player/${player.id}`);
      return;
    }

    alert("Not found. Try again.");
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isSearchOpen) closeSearchOverlay();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  function handleOverlayClick(e) {
    if (e.target.classList.contains(styles.overlay)) {
      closeSearchOverlay();
    }
  }

  function closeSearchOverlay() {
    setIsSearchClosing(true);
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsSearchClosing(false);
    }, 200);
  }

  return (
    <div className={styles.body}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <button className={styles.logoBtn} onClick={() => navigate("/")}>
          <img src="/WEB-Logo/Basketball.png" alt="img" className={styles.WebLogo} />
          Ball Don't Lie
        </button>

        <div className={styles.navButtons}>
          <button className={styles.btn} onClick={() => navigate("/teams")}>
            <img src="/NavBar_icon/Team.png" alt="img" className={styles.btnIcon} />
            Teams
          </button>

          <button className={styles.btn} onClick={() => navigate("/players")}>
            <img src="/NavBar_icon/Player.png" alt="img" className={styles.btnIcon} />
            Players
          </button>

          <button
            className={styles.btn}
            onClick={() => setIsSearchOpen(true)}
          >
            <img src="/NavBar_icon/search.svg" alt="img" className={styles.btnIcon} />
            Search
          </button>
        </div>
      </header>

      <h1 className={styles.playersTitle}>Top 15 Players</h1>
      <section className={styles.playersContainer}>
        {/* Team cards will go here */}
        <div className={styles.playersGrid}>
          {topPlayers.map(player => (
            <div
              key={player.id}
              className={styles.playerCard}
              onClick={() => navigate(`/player/${player.id}`)}
            >
              <img src={player.image} alt={player.name} />
              <p>{player.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Search overlay */}
      {(isSearchOpen || isSearchClosing) && (
        <div
          className={`${styles.overlay} ${isSearchClosing ? styles.close : ""}`}
          onClick={handleOverlayClick}
        >
          <div className={`${styles.searchBox} ${isSearchClosing ? styles.close : ""}`}>
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
