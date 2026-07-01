import { Route, Routes } from "react-router-dom";
import Verify from "./pages/Verify";

function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Email Verification Demo</h1>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Verify />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
