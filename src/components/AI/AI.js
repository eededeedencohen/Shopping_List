import React, { useState, useEffect, useRef, Fragment } from "react";
import { ReactMediaRecorder } from "react-media-recorder-2";
import { DOMAIN } from "../../constants";
import "./AI.css";
import MessageItem from "./MessageItem/MessageItem";
import NeuronBackground from "./NeuronBackground";
import Brobot from "../Brobot/Brobot";

/* ----------------------------------------------------------- */
/*  כלי עזר: קבלת קולות לדפדפן                               */
/* ---------------------------------------------------------- */
const getVoices = () =>
  new Promise((resolve) => {
    const cached = speechSynthesis.getVoices();
    if (cached.length) return resolve(cached);
    speechSynthesis.onvoiceschanged = () =>
      resolve(speechSynthesis.getVoices());
  });

/* ---------------------------------------------------------- */
/*  ניגון MP3 + סנכרון פה + מד רמקול                          */
/* ---------------------------------------------------------- */
function playAudioWithMouthSync(
  url,
  brobotRef,
  setSpkLevel,
  currentAudioRef,
  isAiSpeakingRef,
) {
  const audio = new Audio(url);
  currentAudioRef.current = audio;
  audio.crossOrigin = "anonymous";

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const srcNode = ctx.createMediaElementSource(audio);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  srcNode.connect(analyser);
  analyser.connect(ctx.destination);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let talking = false;
  const threshold = 2;

  const step = () => {
    analyser.getByteTimeDomainData(dataArray);
    const rms =
      Math.sqrt(
        dataArray.reduce((s, v) => s + (v - 128) ** 2, 0) / dataArray.length,
      ) || 0;

    setSpkLevel(Math.round(rms));

    if (rms >= threshold && !talking) {
      brobotRef.current?.talkStart();
      talking = true;
    } else if (rms < threshold && talking) {
      brobotRef.current?.talkStop();
      talking = false;
    }
    if (!audio.paused) requestAnimationFrame(step);
  };

  audio.addEventListener("play", () => {
    isAiSpeakingRef.current = true;
    console.log("%c🔊 AI is speaking...", "color: cyan");
    requestAnimationFrame(step);
  });

  audio.addEventListener("ended", () => {
    brobotRef.current?.talkStop();
    setSpkLevel(0);
    isAiSpeakingRef.current = false;
    console.log("%c✅ AI finished speaking", "color: yellow");
  });

  ctx
    .resume()
    .then(() => audio.play())
    .catch(console.error);
}

/* ---------------------------------------------------------- */
/*  קומפוננטת AI הראשית                                      */
/* ---------------------------------------------------------- */
export default function AI() {
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [spkLevel, setSpkLevel] = useState(0);
  const [micThreshold, setMicThreshold] = useState(15);

  /* ── הגדרות תצוגה ── */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showRobot, setShowRobot] = useState(true);
  const [showRobotPanel, setShowRobotPanel] = useState(true);
  const [showMicMeter, setShowMicMeter] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [speechLanguage, setSpeechLanguage] = useState("auto"); // "auto" | "he" | "en"
  const [ttsLanguage, setTtsLanguage] = useState("en"); // "en" | "he"
  const [ttsVoice, setTtsVoice] = useState(""); // voice ID/name (empty = default)

  /* ── refs לערכים שהלופ קורא בזמן אמת ── */
  const micEnabledRef = useRef(micEnabled);
  const micThresholdRef = useRef(micThreshold);
  const isRecordingRef = useRef(isRecording);

  micEnabledRef.current = micEnabled;
  micThresholdRef.current = micThreshold;
  isRecordingRef.current = isRecording;

  const brobotRef = useRef(null);
  const messageEndRef = useRef(null);
  const recorderFns = useRef({ start: () => {}, stop: () => {} });
  const currentAudioRef = useRef(null);
  const quietSinceRef = useRef(null);
  const recordingLock = useRef(false);
  const isAiSpeakingRef = useRef(false);

  /* ── כיבוי מיקרופון → עצירת הקלטה פעילה ── */
  useEffect(() => {
    if (!micEnabled && isRecording) {
      console.log("%c🚫 micEnabled OFF → stopping recording", "color: orange");
      recorderFns.current.stop();
      setIsRecording(false);
      brobotRef.current?.recordStop();
      recordingLock.current = false;
      quietSinceRef.current = null;
    }
  }, [micEnabled, isRecording]);

  /* ── כיבוי אודיו → עצירת השמעה פעילה ── */
  useEffect(() => {
    if (!audioEnabled) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        brobotRef.current?.talkStop();
        setSpkLevel(0);
        isAiSpeakingRef.current = false;
      }
      speechSynthesis.cancel();
    }
  }, [audioEnabled]);

  /* גלילה אוטומטית */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ניהול הודעות */
  const addMessage = (
    text,
    sender,
    type = "regular",
    data = null,
    action = {},
  ) => setMessages((p) => [...p, { text, sender, type, data, action }]);
  const removeLoadingMessage = () =>
    setMessages((p) => p.filter((m) => m.type !== "loading"));
  const updateLoadingMessage = (text) =>
    setMessages((p) =>
      p.map((m) => (m.type === "loading" ? { ...m, text } : m))
    );

  /* ------------------------------------------------------ */
  /*      טריגר-קול (מיקרופון)                              */
  /* ------------------------------------------------------ */
  useEffect(() => {
    if (!micEnabled) {
      console.log("%c🎤 Mic disabled – no stream requested", "color: gray");
      setMicLevel(0);
      return;
    }

    console.log("%c🎤 Mic enabled – requesting stream…", "color: cyan");
    let ctx, analyser, dataArray, rafId, stream;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = mediaStream;
        console.log("%c🎤 Stream acquired", "color: lime");
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaStreamSource(stream);

        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
          analyser.getByteTimeDomainData(dataArray);
          const rms =
            Math.sqrt(
              dataArray.reduce((s, v) => s + (v - 128) ** 2, 0) /
                dataArray.length,
            ) || 0;

          setMicLevel(Math.round(rms));
          if (isRecordingRef.current) {
            brobotRef.current?.updateRecLevel(Math.round(rms));
          }

          if (
            !isRecordingRef.current &&
            rms >= micThresholdRef.current &&
            !recordingLock.current &&
            !isAiSpeakingRef.current
          ) {
            console.log(
              "%c🎙️ START recording (rms=%d, threshold=%d)",
              "color: lime",
              Math.round(rms),
              micThresholdRef.current,
            );
            recordingLock.current = true;
            currentAudioRef.current?.pause?.();
            speechSynthesis.cancel();
            recorderFns.current.start();
            setIsRecording(true);
            brobotRef.current?.recordStart();
            quietSinceRef.current = null;
          }

          if (isRecordingRef.current) {
            if (rms <= 1) {
              if (!quietSinceRef.current) quietSinceRef.current = Date.now();
              else if (Date.now() - quietSinceRef.current >= 1000) {
                console.log("%c⏹ STOP recording (silence timeout)", "color: red");
                recorderFns.current.stop();
                setIsRecording(false);
                brobotRef.current?.recordStop();
                quietSinceRef.current = null;
              }
            } else {
              quietSinceRef.current = null;
            }
          }

          rafId = requestAnimationFrame(loop);
        };

        ctx.resume().then(loop);
      })
      .catch((err) => console.error("getUserMedia error:", err));

    return () => {
      console.log("%c🛑 Cleaning up microphone stream", "color: orange");
      cancelled = true;
      cancelAnimationFrame(rafId);
      ctx?.close();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micEnabled]);

  /* ------------------------------------------------------ */
  /*      שליחת טקסט ידני                                   */
  /* ------------------------------------------------------ */
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userText = textInput.trim();
    setTextInput("");
    addMessage(userText, "user");
    addMessage("… טוען תשובה", "loading", "loading");

    try {
      const res = await fetch(`${DOMAIN}/api/v1/ai/ai-response-v4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });

      removeLoadingMessage();
      const { aiResponse } = await res.json();
      const {
        messageToUser = "",
        messageType = "regular",
        actions = {},
        data = null,
      } = aiResponse || {};

      const sender = messageType === "regular" ? "assistant" : "operation";
      addMessage(messageToUser, sender, messageType, data, actions);

      if (messageToUser && audioEnabled) {
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(messageToUser);
        utter.lang = "he-IL";
        utter.rate = 1;
        utter.voice =
          (await getVoices()).find((v) => v.lang === "he-IL") ||
          (await getVoices())[0];

        utter.onstart = () => brobotRef.current?.talkStart();
        utter.onend = () => brobotRef.current?.talkStop();
        speechSynthesis.speak(utter);
      }
    } catch (err) {
      console.error(err);
      removeLoadingMessage();
      addMessage("שגיאה. נסה שוב.", "assistant");
    }
  };

  /* ------------------------------------------------------ */
  /*      סוף הקלטה → שליחת אודיו                            */
  /* ------------------------------------------------------ */
  const handleRecordingStop = async (blobUrl) => {
    try {
      const audioBlob = await fetch(blobUrl).then((r) => r.blob());
      const audioFile = new File([audioBlob], "voice.wav", {
        type: "audio/wav",
      });
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("skipAudio", audioEnabled ? "false" : "true");
      if (speechLanguage !== "auto") {
        formData.append("language", speechLanguage);
      }
      formData.append("ttsLanguage", ttsLanguage);
      if (ttsVoice) {
        formData.append("ttsVoice", ttsVoice);
      }

      addMessage("מעלה את ההקלטה…", "loading", "loading");

      const res = await fetch(`${DOMAIN}/api/v1/ai/ai-response-v5`, {
        method: "POST",
        body: formData,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let aiResponse = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, "").trim();
          if (!dataLine) continue;
          try {
            const event = JSON.parse(dataLine);
            if (event.type === "status") {
              updateLoadingMessage(event.status);
            } else if (event.type === "transcription") {
              if (event.text) addMessage(event.text, "user");
            } else if (event.type === "result") {
              aiResponse = event.aiResponse;
            } else if (event.type === "error") {
              console.error("Server error:", event.message);
            }
          } catch (e) {
            console.warn("SSE parse error:", e);
          }
        }
      }

      removeLoadingMessage();

      const {
        messageType = "regular",
        messageToUser = "",
        actions = {},
        data = null,
        audioRoute,
      } = aiResponse || {};

      const sender = messageType === "regular" ? "assistant" : "operation";
      addMessage(messageToUser, sender, messageType, data, actions);

      if (audioRoute && audioEnabled)
        playAudioWithMouthSync(
          `${DOMAIN}/${audioRoute}`,
          brobotRef,
          setSpkLevel,
          currentAudioRef,
          isAiSpeakingRef,
        );

      recordingLock.current = false;
      console.log("%c🔓 UNLOCKED after server response", "color: green");
    } catch (err) {
      console.error(err);
      removeLoadingMessage();
      addMessage("שגיאה בעיבוד ההקלטה.", "assistant");

      recordingLock.current = false;
      console.log("%c🔓 UNLOCKED after error", "color: orange");
    }
  };

  /* ------------------------------------------------------ */
  /*      איפוס                                             */
  /* ------------------------------------------------------ */
  const handleReset = async () => {
    setMessages([]);
    setTextInput("");
    setMicLevel(0);
    setSpkLevel(0);
    await fetch(`${DOMAIN}/api/v1/ai/reset`, { method: "POST" });
  };

  /* ------------------------------------------------------ */
  /*      תצוגה                                             */
  /* ------------------------------------------------------ */
  return (
    <Fragment>
      <ReactMediaRecorder
        audio
        onStop={handleRecordingStop}
        render={({ startRecording, stopRecording }) => {
          recorderFns.current.start = startRecording;
          recorderFns.current.stop = stopRecording;
          return null;
        }}
      />

      <div className="ai-container">
        <NeuronBackground />

        {/* ── Dark Overlay (closes settings on click) ── */}
        {settingsOpen && (
          <div
            className="settings-overlay"
            onClick={() => setSettingsOpen(false)}
          />
        )}

        {/* ── Settings Panel ── */}
        <div className={`settings-panel ${settingsOpen ? "open" : ""}`}>
          <div className="settings-header">
            <h3 className="settings-title">הגדרות</h3>
            <button
              className="settings-close-btn"
              onClick={() => setSettingsOpen(false)}
            >
              {"\u2715"}
            </button>
          </div>

          <div className="settings-section">
            <div className="settings-section-icon">&#x1f50a;</div>
            <span className="settings-section-title">אודיו</span>

            <label className="toggle-row">
              <span>השמעת קול</span>
              <div className={`toggle-switch ${audioEnabled ? "on" : ""}`}
                   onClick={() => setAudioEnabled((p) => !p)}>
                <div className="toggle-knob" />
              </div>
            </label>
          </div>

          <div className="settings-section">
            <div className="settings-section-icon">&#x1f310;</div>
            <span className="settings-section-title">שפת דיבור</span>

            <div className="language-select-row">
              {[
                { value: "auto", label: "זיהוי אוטומטי" },
                { value: "he", label: "עברית" },
                { value: "en", label: "English" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`lang-btn ${speechLanguage === opt.value ? "active" : ""}`}
                  onClick={() => setSpeechLanguage(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-icon">&#x1f50a;</div>
            <span className="settings-section-title">שפת תשובה קולית</span>

            <div className="language-select-row">
              {[
                { value: "en", label: "English" },
                { value: "he", label: "עברית" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`lang-btn ${ttsLanguage === opt.value ? "active" : ""}`}
                  onClick={() => { setTtsLanguage(opt.value); setTtsVoice(""); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="voice-select-row">
              <span className="voice-label">קול</span>
              <select
                className="voice-dropdown"
                value={ttsVoice}
                onChange={(e) => setTtsVoice(e.target.value)}
              >
                {ttsLanguage === "en" ? (
                  <>
                    <option value="">Robot (ברירת מחדל)</option>
                    <option value="21m00Tcm4TlvDq8ikWAM">Rachel (נקבה)</option>
                    <option value="EXAVITQu4vr4xnSDxMaL">Bella (נקבה)</option>
                    <option value="pNInz6obpgDQGcFmaJgB">Adam (זכר)</option>
                    <option value="ErXwobaYiN019PkySvjV">Antoni (זכר)</option>
                    <option value="TxGEqnHWrfWFTfGW9XjX">Josh (זכר)</option>
                    <option value="VR6AewLTigWG4xSOukaG">Arnold (זכר)</option>
                    <option value="29vD33N1CtxCmqQRPOHJ">Drew (זכר)</option>
                  </>
                ) : (
                  <>
                    <option value="">Alnilam - זכר (ברירת מחדל)</option>
                    <option value="he-IL-Chirp3-HD-Puck">Puck (זכר)</option>
                    <option value="he-IL-Chirp3-HD-Charon">Charon (זכר)</option>
                    <option value="he-IL-Chirp3-HD-Fenrir">Fenrir (זכר)</option>
                    <option value="he-IL-Chirp3-HD-Orus">Orus (זכר)</option>
                    <option value="he-IL-Chirp3-HD-Aoede">Aoede (נקבה)</option>
                    <option value="he-IL-Chirp3-HD-Kore">Kore (נקבה)</option>
                    <option value="he-IL-Chirp3-HD-Leda">Leda (נקבה)</option>
                    <option value="he-IL-Chirp3-HD-Zephyr">Zephyr (נקבה)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-icon">&#x1f916;</div>
            <span className="settings-section-title">רובוט</span>

            <label className="toggle-row">
              <span>הצגת רובוט</span>
              <div className={`toggle-switch ${showRobot ? "on" : ""}`}
                   onClick={() => setShowRobot((p) => !p)}>
                <div className="toggle-knob" />
              </div>
            </label>

            <label className={`toggle-row ${!showRobot ? "disabled-row" : ""}`}>
              <span>תפריט רובוט</span>
              <div className={`toggle-switch ${showRobot && showRobotPanel ? "on" : ""} ${!showRobot ? "disabled-switch" : ""}`}
                   onClick={() => { if (showRobot) setShowRobotPanel((p) => !p); }}>
                <div className="toggle-knob" />
              </div>
            </label>
          </div>

          <div className="settings-section">
            <div className="settings-section-icon">&#x1f399;</div>
            <span className="settings-section-title">מיקרופון</span>

            <label className="toggle-row">
              <span>הפעלת סף מיקרופון</span>
              <div className={`toggle-switch ${micEnabled ? "on" : ""}`}
                   onClick={() => setMicEnabled((p) => !p)}>
                <div className="toggle-knob" />
              </div>
            </label>

            <div className={`threshold-setting ${!micEnabled ? "disabled-section" : ""}`}>
              <div className="threshold-header">
                <span>סף מיקרופון</span>
                <span className="threshold-value">{micThreshold}</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={micThreshold}
                onChange={(e) => {
                  setMicThreshold(+e.target.value);
                  console.log("Microphone threshold changed to:", +e.target.value);
                }}
                className="settings-slider"
                disabled={!micEnabled}
                style={{
                  background: (() => {
                    const pct = Math.round(((micThreshold - 1) / 199) * 100);
                    return `linear-gradient(to right, rgba(255,255,255,0.12) ${pct}%, #1ed1ff ${pct}%)`;
                  })()
                }}
              />
            </div>

            <label className="toggle-row">
              <span>הצגת מדי אודיו</span>
              <div className={`toggle-switch ${showMicMeter ? "on" : ""}`}
                   onClick={() => setShowMicMeter((p) => !p)}>
                <div className="toggle-knob" />
              </div>
            </label>
          </div>
        </div>

        {/* ── Settings Toggle Button (inside content, not on toolbar) ── */}
        <button
          className="settings-toggle-btn"
          onClick={() => setSettingsOpen((p) => !p)}
          title="הגדרות"
        >
          {"\u2699"}
        </button>

        {/* ── Brobot ── */}
        {showRobot && (
          <div>
            <Brobot ref={brobotRef} showPanel={showRobotPanel} />
          </div>
        )}

        {/* ── Audio Meters ── */}
        {showMicMeter && (
          <div className="meters">
            <div className="meter-item mic-meter">
              <span className="meter-icon">MIC</span>
              <div className="meter-bar-bg">
                <div
                  className="meter-bar-fill mic-fill"
                  style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
                />
              </div>
              <span className="meter-val">{micLevel}</span>
            </div>
            <div className="meter-item spk-meter">
              <span className="meter-icon">SPK</span>
              <div className="meter-bar-bg">
                <div
                  className="meter-bar-fill spk-fill"
                  style={{ width: `${Math.min(spkLevel * 2, 100)}%` }}
                />
              </div>
              <span className="meter-val">{spkLevel}</span>
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        <div className="messages-container">
          {messages.map((m, i) => (
            <MessageItem
              key={i}
              message={m.text}
              sender={m.sender}
              type={m.type}
              data={m.data}
              action={m.action}
            />
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="user-text-box">
          <form onSubmit={handleOnSubmit}>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="...הקלד הודעה"
              dir="auto"
              onFocus={() => brobotRef.current?.look("down")}
              onBlur={() => brobotRef.current?.look("center")}
            />
            <button type="submit">שלח</button>
            <button type="button" onClick={handleReset}>
              אפס
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
}
