import { useState } from 'react'
import "./App.css"
import { Main_Tab, Calendar_Tab, Goal_Tab } from "./Tabs";
import TabBar from "./Tabs/TabBar";

function App() {
  const [tab, setTab] = useState("Today");

  return (
    <div>
      <div style={{ minHeight: "100svh"}}>
        <TabBar initial={tab} onChange={setTab} />
        <main style={{ padding: 20, paddingBottom: 140 }}>
          {tab === "Calendar" && <Calendar_Tab />}
          {tab === "Today" && <Main_Tab />}
          {tab === "Goals" && <Goal_Tab />}
        </main>
      </div>
    </div>
  );
}

export default App;
