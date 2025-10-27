import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./TeamTemplate.module.css";
import { getTeamById, searchPlayersByName } from "../../api/nbaClient";

export default function TeamTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Call API client handler to get information
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const t = await getTeamById(Number(id));
        setTeam(t || null);
      } catch (e) {
        setErr(e?.message || "Failed to load team");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  function closeSearchOverlay() {
    setIsSearchClosing(true);
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsSearchClosing(false);
    }, 200);
  }

  function handleOverlayClick(e) {
    if (e.target.classList.contains(styles.overlay)) {
      closeSearchOverlay();
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

  const city = team?.city || team?.name || "—";
  const conference = team?.leagues?.standard?.conference || team?.conference || "—";
  const division = team?.leagues?.standard?.division || team?.division || "—";

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

      <div className={styles.container}>
        <section className={styles.leftSide}>
          <table className={styles.infoTable}>
            <tbody>
              <tr>
                <td colSpan="2" className={styles.teamName}>
                  {loading ? "Loading…" : (team?.name || team?.full_name || "Team")}
                </td>
              </tr>

              <tr>
                <td colSpan="2" className={styles.teamPhotoCell}>
                  {err && <p>{err}</p>}
                  {!err && (
                    <img
                      src={team?.logo || "/placeholder-team.png"}
                      className={styles.teamPhoto}
                      alt={team?.name || "Team"}
                    />
                  )}
                </td>
              </tr>

              <tr><td>City:</td><td>{city}</td></tr>
              <tr><td>Conference:</td><td>{conference}</td></tr>
              <tr><td>Division:</td><td>{division}</td></tr>
              <tr><td>Founded:</td><td>—</td></tr>
              <tr><td>Arena:</td><td>—</td></tr>
              <tr><td>Head Coach:</td><td>—</td></tr>
              <tr><td>Owner:</td><td>—</td></tr>
              <tr><td>Championships:</td><td>—</td></tr>
            </tbody>
          </table>
        </section>
      </div>

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
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
