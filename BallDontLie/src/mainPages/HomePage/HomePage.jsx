import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getTeams, searchPlayersByName } from "../../api/nbaClient";
import { getUpcomingGames } from "../../api/nbaClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);


  // ---------- TEAMS ----------
  const [teamsData, setTeamsData] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errorTeams, setErrorTeams] = useState("");

  // ---------- GAMES ----------
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  // Calendat open/close
  const [showCalendar, setShowCalendar] = useState(false);

  // close function calendar
  function handleDateChange(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;

    console.log("📅 Selected date (pure local):", formatted);
    setSelectedDate(formatted);
    setShowCalendar(false);
  }

  // Random 10 cards (stable until teamsData changes)
  const topTeam = useMemo(() => {
    const arr = [...teamsData];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 10);
  }, [teamsData]);


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

  // ---------- Load Games ----------
  useEffect(() => {
    let intervalId;

    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const games = await getUpcomingGames(selectedDate);
        setUpcomingGames(games || []);
      } catch (err) {
        console.error("❌ Failed to load games:", err);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGames();
    intervalId = setInterval(fetchGames, 10000); // updatre every 20sec

    return () => clearInterval(intervalId);
  }, [selectedDate]);


  // 🔁Automatic score update every 15 seconds, only if there are LIVE matches
  useEffect(() => {
    const liveGames = upcomingGames.filter(g => {
      const s = String(g.status?.short || "").toUpperCase();
      const l = String(g.status?.long || "").toLowerCase();
      return ["1Q", "2Q", "3Q", "4Q", "OT", "AOT", "LIVE"].includes(s) || l.includes("live") || l.includes("progress");
    });
    if (liveGames.length === 0) return;

    const interval = setInterval(async () => {
      try {
        console.log("🔄 Refreshing live scores...");
        const games = await getUpcomingGames(selectedDate);
        setUpcomingGames(games || []);
      } catch (err) {
        console.error("❌ Live refresh failed:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [upcomingGames, selectedDate]);





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

  // Determinate the week around chosen day
  function getWeekDays(dateStr) {
    const date = new Date(`${dateStr}T12:00:00`);
    const start = new Date(date);
    const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
    start.setDate(date.getDate() - dayOfWeek); 

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      return {
        abbr: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        num: d.getDate(),
        dateStr: formatted,
        isActive: formatted === dateStr,
      };
    });
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
        {/* 🔹 Date and week selection container */}
        <section className={styles.dateNavContainer}>
          {/* The left part is the date and icon */}
          <div className={styles.dateLeft} onClick={() => setShowCalendar(!showCalendar)}>
            <img src="/NavBar_icon/calendar.svg" alt="calendar" className={styles.calendarIcon} />
            {(() => {
              const [year, month, day] = selectedDate.split("-");
              const d = new Date(year, month - 1, day);
              return d.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).toUpperCase();
            })()}
          </div>

          {/* The central part is the days of the week */}
          <div className={styles.weekDays}>
            {getWeekDays(selectedDate).map((day, idx) => (
              <div
                key={idx}
                className={`${styles.weekDay} ${day.isActive ? styles.activeDay : ""}`}
                onClick={() => setSelectedDate(day.dateStr)}
              >
                <div className={styles.dayAbbr}>{day.abbr}</div>
                <div className={styles.dayNum}>{day.num}</div>
              </div>
            ))}
          </div>

          {/* Drop-down calendar */}
          {showCalendar && (
            <div className={styles.calendarDropdown}>
              <Calendar
                locale="en-US"
                onChange={handleDateChange}
                value={new Date(`${selectedDate}T12:00:00`)}
                next2Label={null}
                prev2Label={null}
              />
            </div>
          )}
        </section>

        <section className={styles.gameContainer}>
          <section className={styles.upcomingGames}>
            <div className={styles.gamesGrid}>
              {!loadingGames && upcomingGames.length > 0 ? (
                upcomingGames.map((game, idx) => {
                  const gameTime = new Date(game.date?.start);
                  // ---- Detect status using doc from  API-Sports ----
                  const shortStatus = String(game.status?.short || "").toUpperCase();
                  const longStatus = String(game.status?.long || "").toLowerCase();
                  const clock = game.status?.clock || null;

                  const isLive =
                    longStatus.includes("in play") ||
                    clock !== null;


                  // Match End
                  const isFinished =
                    ["FT", "FINAL"].includes(shortStatus) ||
                    longStatus.includes("final") ||
                    longStatus.includes("ended") ||
                    longStatus.includes("finished");

                  // Match is not Start
                  const isUpcoming = !isLive && !isFinished;


                  const home = game.teams?.home || { name: "Home Team", code: "HOM", logo: "/fallback.png" };
                  const visitor = game.teams?.visitors || { name: "Visitor Team", code: "VIS", logo: "/fallback.png" };



                  return (
                    <div
                      key={game.id || game.gameId || idx}
                      className={styles.gameCard}
                      onClick={() => navigate(`/game/${game.id || game.gameId}`)}
                    >
                      {/* Left Team */}
                      <div className={styles.team}>
                        <img src={home.logo} alt={home.name} />
                        <span>{home.code}</span>
                      </div>

                      {/* Central Block */}
                      <div className={styles.centerBlock}>
                        {/* Время вверху */}
                        <div className={styles.gameTimeTop}>
                          {isLive ? (
                            <div className={styles.liveIndicator}>
                              <span className={styles.liveDot}></span>
                              <span className={styles.liveText}>LIVE</span>
                            </div>
                          ) : isFinished ? (
                            "Final"
                          ) : (
                            gameTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          )}
                        </div>



                        {/* Score or VS */}
                        <div className={styles.vs}>
                          {isLive
                            ? `${game.scores?.home?.points ?? 0} - ${game.scores?.visitors?.points ?? 0}`
                            : isFinished
                              ? `${game.scores?.home?.points ?? 0} - ${game.scores?.visitors?.points ?? 0}`
                              : "vs"}
                        </div>


                        {/* Date on bottom */}
                        {/* Date or clock info on bottom */}
                        <div className={styles.gameDateBottom}>
                          {isLive ? (
                            <>
                              Q{game.periods?.current || "?"} – {game.status?.clock || "--:--"}
                            </>
                          ) : isFinished ? (
                            "Final"
                          ) : (
                            gameTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          )}
                        </div>

                      </div>

                      {/* Right Team */}
                      <div className={styles.team}>
                        <img src={visitor.logo} alt={visitor.name} />
                        <span>{visitor.code}</span>
                      </div>
                    </div>
                  );

                })
              ) : !loadingGames ? (
                <p>No upcoming games.</p>
              ) : (
                <p>Loading games…</p>
              )}
            </div>
          </section>
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
