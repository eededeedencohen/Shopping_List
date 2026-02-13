import { useState, useCallback } from "react";
import "./App.css";
import Routing from "./Routing";
import Toolbar from "./components/Toolbar/Toolbar";
import SplashScreen from "./components/SplashScreen/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={hideSplash} />}
      <div className="App">
        <Toolbar />
        <Routing />
      </div>
    </>
  );
}

export default App;