import styles from "./PlayersPage.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getTeams, searchPlayersByName, getTopPlayersBySeason } from "../../api/nbaClient";

export default function PlayersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);

  const [playersPage, setPlayersPage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const topPlayers = useMemo(() => playersPage.slice(0, 15), [playersPage]);

  // ---------- TEAMS ----------
  const [teamsData, setTeamsData] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errorTeams, setErrorTeams] = useState("");

  // Random 10 cards (stable until teamsData changes)
  const topTeam = useMemo(() => {
    const arr = [...teamsData];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 10);
  }, [teamsData]);

  // Call API client handler to get teams
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

  async function handleSearch() {
    const query = search.trim().toLowerCase();
    if (!query) return alert("Type NBA Player or Team");

    // 1) Search Teams
    const matchedTeams = teamsData.filter(t =>
      (t.name?.toLowerCase().includes(query)) ||
      (t.full_name?.toLowerCase().includes(query)) ||
      (t.shortName?.toLowerCase() === query)
    );

    if (matchedTeams.length === 1) {
      navigate(`/team/${matchedTeams[0].id}`);
      return;
    } else if (matchedTeams.length > 1) {
      return alert("Multiple teams matched. Please enter full team name");
    }

    // 2) Search Players
    try {
      const players = await searchPlayersByName(search, new Date().getFullYear() - 1);
      if (!players || players.length === 0) {
        return alert("Not found. Try again with full name");
      } else if (players.length === 1) {
        navigate(`/player/${players[0].id}`);
        return;
      } else {
        return alert("Multiple players matched. Please enter full first and last name");
      }
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


  // ----------LOADING TOP PLAYERS----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // << Pull the actual best 15 by season. FREE VERSION only allows for year 2021 -> 2023
        const season = 2023;
        const res = await getTopPlayersBySeason({ season, limit: 15, metric: "pts" }); // or "eff"
        setPlayersPage(res || []);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed to load players");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  return (
    <div className={styles.body}>
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

      <h1 className={styles.playersTitle}>Top 15 Players</h1>
      <section className={styles.playersContainer}>
        <div className={styles.playersGrid}>
          {loading && <p>Loading players…
            Please note it will take around one to two minutes due to API request restrictions</p>}
          {err && <p>{err}</p>}
          {!loading && !err && topPlayers.map(player => (
            <div
              key={player.id}
              className={styles.playerCard}
              onClick={() => navigate(`/player/${player.id}`)}
            >
              <img
                src={player?.leagues?.standard?.team?.logo || "/placeholder-player.png"}
                alt={player.firstname ? `${player.firstname} ${player.lastname}` : "Player"}
              />
              <p>
                {player.firstname && player.lastname
                  ? `${player.firstname} ${player.lastname}`
                  : (player.name || "Player")}
              </p>
            </div>
          ))}
        </div>
      </section>

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

