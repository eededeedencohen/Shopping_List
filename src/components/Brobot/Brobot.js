import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./Brobot.css";

import BrobotFront from "./BrobotImages/BrobotFront.png";
// import BrobotLeft from "./BrobotImages/BrobotLeft.png";
import BrobotRight from "./BrobotImages/BrobotRight.png";

function Brobot(_, ref) {
  /* ───────── state & refs ───────── */
  const brobotRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const [mouthHz, setMouthHz] = useState(4);
  const [talkLen, setTalkLen] = useState(3);
  const [talking, setTalking] = useState(false);

  const [headImg, setHeadImg] = useState(BrobotFront);
  const [orient, setOrient] = useState("front");
  const [shakeHz, setShakeHz] = useState(4);
  const [shakeCnt, setShakeCnt] = useState(3);
  const [shaking, setShaking] = useState(false);

  const [recording, setRecording] = useState(false);

  const [eyeDir, setEyeDir] = useState("center"); // up|down|left|right|center

  useEffect(() => {
    [BrobotFront, BrobotRight].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  const eyePos = {
    center: [0, 0],
    up: [0, -35],
    down: [0, 35],
    left: [-30, 0],
    right: [30, 0],
  }[eyeDir];

  /* ───────── drag ───────── */
  useEffect(() => {
    const move = (x, y) =>
      (brobotRef.current.style.transform = `translate3d(${
        x - dragOffset.current.x
      }px, ${y - dragOffset.current.y}px,0)`);

    const onMouseMove = (e) => dragging && move(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stopDrag = () => setDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [dragging]);

  const startDrag = (x, y) => {
    const rect = brobotRef.current.getBoundingClientRect();
    dragOffset.current = { x: x - rect.left, y: y - rect.top };
    setDragging(true);
  };

  /* ───────── talk ───────── */
  const talkSpeed = 1 / mouthHz;
  const talk = () => {
    if (talking) return;
    setTalking(true);
    setTimeout(() => setTalking(false), talkLen * 1000);
  };
  const stopTalk = () => setTalking(false);

  /* ───────── shake ───────── */
  const shakeHead = () => {
    if (shaking) return;
    setShaking(true);
    const period = 1000 / shakeHz;
    const total = shakeCnt * 4;
    let step = 0;
    const timer = setInterval(() => {
      switch (step % 4) {
        case 0:
          setHeadImg(BrobotRight);
          setOrient("left");
          break;
        case 1:
          setHeadImg(BrobotFront);
          setOrient("front");
          break;
        case 2:
          setHeadImg(BrobotRight);
          setOrient("right");
          break;
        case 3:
          setHeadImg(BrobotFront);
          setOrient("front");
          break;
        default:
      }
      if (++step >= total) {
        clearInterval(timer);
        setHeadImg(BrobotFront);
        setOrient("front");
        setShaking(false);
      }
    }, period);
  };

  /* ───────── recording ───────── */
  const startRec = () => setRecording(true);
  const stopRec = () => setRecording(false);

  /* ───────── expose API ───────── */
  useImperativeHandle(ref, () => ({
    /* הפניית מבט */
    look(dir = "center") {
      setEyeDir(dir);
    },

    /* “דיבור גס” למספר מילישניות */
    talk(ms = talkLen * 1000) {
      setTalking(true);
      setTimeout(() => setTalking(false), ms);
    },

    /* בקרה מדויקת ע”י TTS */
    talkStart() {
      setTalking(true);
    },
    talkStop() {
      setTalking(false);
    },

    /* אנימציות נוספות */
    shake() {
      shakeHead();
    },
    recordStart() {
      startRec();
    },
    recordStop() {
      stopRec();
    },
  }));

  /* ───────── panel state ───────── */
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("talk"); // talk|shake|record|eyes

  /* ───────── render ───────── */
  return (
    <>
      {/* === robot === */}
      <div
        ref={brobotRef}
        className={`brobot-container ${orient}`}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={(e) =>
          startDrag(e.touches[0].clientX, e.touches[0].clientY)
        }
      >
        <div className="brobot-bg" />
        <img src={headImg} alt="Brobot" className="brobot-img" />

        <div className="brobot-screen">
          {!recording ? (
            <>
              <span className="eye left">
                <span
                  className="pupil"
                  style={{ "--dx": `${eyePos[0]}%`, "--dy": `${eyePos[1]}%` }}
                />
              </span>
              <span className="eye right">
                <span
                  className="pupil"
                  style={{ "--dx": `${eyePos[0]}%`, "--dy": `${eyePos[1]}%` }}
                />
              </span>
              <span
                className={`mouth ${talking ? "speaking" : ""}`}
                style={{ "--talk-speed": `${talkSpeed}s` }}
              />
            </>
          ) : (
            <div className="rec-indicator">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="bar" style={{ "--i": i }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === control panel === */}
      <div className={`brobot-panel ${panelOpen ? "open" : "closed"}`}>
        <button className="toggle-btn" onClick={() => setPanelOpen(!panelOpen)}>
          {panelOpen ? "◀︎" : "▶︎"}
        </button>

        {panelOpen && (
          <>
            <div className="tabs">
              {[
                ["talk", "דיבור"],
                ["shake", "תנועת ראש"],
                ["record", "הקלטה"],
                ["eyes", "תזוזת עיניים"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  className={`tab-btn ${activeTab === k ? "active" : ""}`}
                  onClick={() => setActiveTab(k)}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === "talk" && (
                <>
                  <label>
                    מהירות ({mouthHz} Hz)
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mouthHz}
                      onChange={(e) => setMouthHz(+e.target.value)}
                    />
                  </label>
                  <label>
                    משך ({talkLen}s)
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={talkLen}
                      onChange={(e) => setTalkLen(+e.target.value)}
                    />
                  </label>
                  <div className="panel-buttons">
                    <button onClick={talk}>▶︎ דבר</button>
                    <button onClick={stopTalk}>■ עצור</button>
                  </div>
                </>
              )}

              {activeTab === "shake" && (
                <>
                  <label>
                    חזרות ({shakeCnt})
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={shakeCnt}
                      onChange={(e) => setShakeCnt(+e.target.value)}
                    />
                  </label>
                  <label>
                    מהירות ({shakeHz} Hz)
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={shakeHz}
                      onChange={(e) => setShakeHz(+e.target.value)}
                    />
                  </label>
                  <div className="panel-buttons">
                    <button onClick={shakeHead}>↔︎ נענע</button>
                  </div>
                </>
              )}

              {activeTab === "record" && (
                <div className="panel-buttons">
                  <button onClick={startRec} disabled={recording}>
                    ▶︎ הקלט
                  </button>
                  <button onClick={stopRec} disabled={!recording}>
                    ■ עצור
                  </button>
                </div>
              )}

              {activeTab === "eyes" && (
                <div className="eyes-grid">
                  {["up", "left", "right", "down", "center"].map((dir) => (
                    <button
                      key={dir}
                      className={`eyes-btn ${dir} ${
                        eyeDir === dir ? "chosen" : ""
                      }`}
                      onClick={() => setEyeDir(dir)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default forwardRef(Brobot);
