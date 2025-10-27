import { useNavigate } from "react-router-dom";
import styles from "./TeamsPage.module.css";
import { useState, useEffect, useMemo } from "react";
import { getTeams, searchPlayersByName } from "../../api/nbaClient";

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);

  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Call API client handler to get information
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const teams = await getTeams();
        setTeamsData(teams || []);
      } catch (e) {
        setErr(e?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // API conference is often under leagues.standard.conference; also support flat conference just in case.
  const east = useMemo(
    () => teamsData.filter(t => (t?.leagues?.standard?.conference || t?.conference || "").toLowerCase() === "east"),
    [teamsData]
  );
  const west = useMemo(
    () => teamsData.filter(t => (t?.leagues?.standard?.conference || t?.conference || "").toLowerCase() === "west"),
    [teamsData]
  );

  async function handleSearch() {
    if (!search.trim()) return alert("Type NBA Player");
    try {
      const results = await searchPlayersByName(search.trim(), new Date().getFullYear() - 1);
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

      <div className={styles.conferences}>
        <section className={styles.conference}>
          <h2 className={styles.conferenceTitle}>Eastern Conference</h2>
          <div className={styles.teamsGrid}>
            {loading && <p>Loading teams…</p>}
            {err && <p>{err}</p>}
            {!loading && !err && east.map(team => (
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

        <section className={styles.conference}>
          <h2 className={styles.conferenceTitle}>Western Conference</h2>
          <div className={styles.teamsGrid}>
            {!loading && !err && west.map(team => (
              <div
                key={team.id}
                className={styles.teamCard}
                onClick={() => navigate(`/team/${team.id}`)} // fixed
              >
                <img src={team.logo} alt={team.name} />
                <p>{team.name || team.full_name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        This site is under development.
        <br /> If you have any suggestions or encounter any errors while using this site, please contact me by email aalavrynets@gmail.com.
        <br />Thank you for your feedback.
      </footer>

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
