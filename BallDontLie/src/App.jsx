import { Routes, Route } from "react-router-dom";

import HomePage from "./mainPages/HomePage/HomePage.jsx/";
import TeamsPage from "./mainPages/TeamsPage/TeamsPage.jsx"
import TeamTemplate from "./page/TeamTemplate/TeamTemplate.jsx";
import PlayersPage from "./mainPages/PlayersPage/PlayersPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/team/:id" element={<TeamTemplate />} />
      <Route path="/players" element={<PlayersPage />} />

    </Routes>
  );
}

export default App;
