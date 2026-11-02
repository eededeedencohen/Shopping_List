import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import Routing from "./Routing";
import Toolbar from "./components/Toolbar/Toolbar";
import BottomNav from "./components/BottomNav/BottomNav";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import ImageWarmup from "./components/Images/ImageWarmup";
import CompanionLayer, { isDockRoute } from "./components/Companion/CompanionLayer";
import { useCompanion } from "./context/CompanionContext";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);
  const { hasSession } = useCompanion();
  const { pathname } = useLocation();
  const dockShown = hasSession && isDockRoute(pathname);

  return (
    <>
      {showSplash && <SplashScreen onFinish={hideSplash} />}
      <ScrollToTop />
      {/* Pre-warms the cart's product images while the splash is showing */}
      <ImageWarmup />
      {/* cmp-on: the companion dock floats over the bottom of the pages, so
          they get extra transparent bottom border while it is there */}
      <div className={`App${dockShown ? " cmp-on" : ""}`}>
        <Toolbar />
        {/* The ONLY scroll area — sits between the fixed toolbar and the
            in-flow bottom nav, so page content can never go under either. */}
        <main className="app-scroll">
          <Routing />
        </main>
        <BottomNav />
      </div>
      {/* ליווי בסופר: the running-total dock chip on every other page */}
      <CompanionLayer />
    </>
  );
}

export default App;