import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { DOMAIN } from "../constants";

const AiSettingsContext = createContext(null);

const DEFAULTS = {
  audioEnabled: true,
  showRobot: true,
  showRobotPanel: true,
  showMicMeter: false,
  micEnabled: true,
  micThreshold: 15,
  speechLanguage: "auto",
  ttsLanguage: "en",
  ttsVoice: "",
};

export const AiSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const pendingRef = useRef(null);
  const timerRef = useRef(null);

  // טעינה ראשונית מהשרת
  useEffect(() => {
    fetch(`${DOMAIN}/api/v1/ai-settings`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          const { _id, __v, userId, ...rest } = res.data;
          setSettings((prev) => ({ ...prev, ...rest }));
        }
      })
      .catch((err) => console.error("Failed to load AI settings:", err))
      .finally(() => setLoaded(true));
  }, []);

  // שליחה לשרת עם debounce – fire-and-forget
  const flushToServer = useCallback((patch) => {
    fetch(`${DOMAIN}/api/v1/ai-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch((err) => console.error("Failed to save AI settings:", err));
  }, []);

  // עדכון הגדרה בודדת – מיידי ב-state, debounced לשרת
  const updateSetting = useCallback(
    (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      // צבירת שינויים ושליחה אחרי 500ms של שקט
      pendingRef.current = { ...pendingRef.current, [key]: value };
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (pendingRef.current) {
          flushToServer(pendingRef.current);
          pendingRef.current = null;
        }
      }, 500);
    },
    [flushToServer]
  );

  return (
    <AiSettingsContext.Provider value={{ settings, updateSetting, loaded }}>
      {children}
    </AiSettingsContext.Provider>
  );
};

export const useAiSettings = () => useContext(AiSettingsContext);
