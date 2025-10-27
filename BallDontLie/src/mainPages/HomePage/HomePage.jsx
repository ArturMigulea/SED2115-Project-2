import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getTeams, searchPlayersByName } from "../../api/nbaClient";

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);

  const [teamsData, setTeamsData] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errorTeams, setErrorTeams] = useState("");

  // Call API client handler to get information
  useEffect(() => {
    (async () => {
      setLoadingTeams(true);
      setErrorTeams("");
      try {
        const teams = await getTeams(); // all teams
        setTeamsData(teams || []);
      } catch (err) {
        setErrorTeams(err?.message || "Failed to load teams");
      } finally {
        setLoadingTeams(false);
      }
    })();
  }, []);

  // Random 10 cards (stable until teamsData changes)
  const topTeam = useMemo(() => {
    const arr = [...teamsData];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 10);
  }, [teamsData]);

  async function handleSearch() {
    if (!search.trim()) return alert("Type NBA Player");
    try {
      const results = await searchPlayersByName(search.trim(), new Date().getFullYear() - 1); // recent season
      const player = results?.[0];
      if (player?.id) {
        navigate(`/player/${player.id}`);
        return;
      }
      alert("Not found. Try again.");
    } catch {
      alert("Search failed. Try again.");
    }
  }

  // Close when press Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isSearchOpen) closeSearchOverlay();
      if (e.key === "Enter" && isSearchOpen) handleSearch();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, search]);

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

          <button className={styles.btn} onClick={() => setIsSearchOpen(true)}>
            <img src="/NavBar_icon/search.svg" alt="img" className={styles.btnIcon} />
            Search
          </button>
        </div>
      </header>

      {/* Main container for all blocks */}
      <div className={styles.containers}>
        {/* Game/Search container */}
        <h1 className={styles.GamesTitle}>Latest games</h1>
        <section className={styles.gameContainer}>
          {/* Left as-is (no styling/layout change) */}
        </section>

        {/* Players container */}
        <h1 className={styles.PlayersTitle}>Top 10 Players</h1>
        <section className={styles.playersContainer}>
          {/* Placeholder left as before */}
        </section>

        {/* Teams container */}
        <h1 className={styles.TeamsTitle}>Teams</h1>
        <section className={styles.teamsContainer}>
          <div className={styles.teamsGrid}>
            {loadingTeams && <p>Loading teams…</p>}
            {errorTeams && <p>{errorTeams}</p>}
            {!loadingTeams && !errorTeams && topTeam.map(team => (
              <div
                key={team.id}
                className={styles.teamCard}
                onClick={() => navigate(`/team/${team.id}`)}
              >
                <img src={team.logo} alt={team.name} />
                <p>{team.name || team.full_name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        This site is under development.
        <br /> If you have any suggestions or encounter any errors while using this site, please contact me by email aalavrynets@gmail.com.
        <br />Thank you for your feedback.
      </footer>

      {/* Search overlay */}
      {(isSearchOpen || isSearchClosing) && (
        <div className={`${styles.overlay} ${isSearchClosing ? styles.close : ""}`} onClick={handleOverlayClick}>
          <div className={`${styles.searchBox} ${isSearchClosing ? styles.close : ""}`}>
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
