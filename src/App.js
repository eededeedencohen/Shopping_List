import { useState, useCallback } from "react";
import "./App.css";
import Routing from "./Routing";
import Toolbar from "./components/Toolbar/Toolbar";
import BottomNav from "./components/BottomNav/BottomNav";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SplashScreen from "./components/SplashScreen/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={hideSplash} />}
      <ScrollToTop />
      <div className="App">
        <Toolbar />
        {/* The ONLY scroll area — sits between the fixed toolbar and the
            in-flow bottom nav, so page content can never go under either. */}
        <main className="app-scroll">
          <Routing />
        </main>
        <BottomNav />
      </div>
    </>
  );
}

export default App;