// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   Fragment,
// } from "react";
// import { ReactMediaRecorder } from "react-media-recorder-2";
// import { DOMAIN } from "../../constants";
// import "./AI.css";
// import MessageItem from "./MessageItem/MessageItem";
// import NeuronBackground from "./NeuronBackground";
// import Brobot from "../Brobot/Brobot";

// /* ---------------------------------------------------------- */
// /*  כלי עזר: קבלת קולות לדפדפן                               */
// /* ---------------------------------------------------------- */
// const getVoices = () =>
//   new Promise((resolve) => {
//     const cached = speechSynthesis.getVoices();
//     if (cached.length) return resolve(cached);
//     speechSynthesis.onvoiceschanged = () =>
//       resolve(speechSynthesis.getVoices());
//   });

// /* ---------------------------------------------------------- */
// /*  ניגון MP3 + סנכרון פה + מד עוצמה                          */
// /* ---------------------------------------------------------- */
// function playAudioWithMouthSync(url, brobotRef, setNoiseLevel) {
//   const audio = new Audio();
//   audio.src = url;
//   audio.crossOrigin = "anonymous";

//   const AudioCtx = window.AudioContext || window.webkitAudioContext;
//   const ctx = new AudioCtx();
//   const srcNode = ctx.createMediaElementSource(audio);
//   const analyser = ctx.createAnalyser();
//   analyser.fftSize = 2048;
//   srcNode.connect(analyser);
//   analyser.connect(ctx.destination);

//   const dataArray = new Uint8Array(analyser.frequencyBinCount);
//   let talking = false;
//   const threshold = 2; // ← מדבר כש-RMS ≥ 3

//   const step = () => {
//     analyser.getByteTimeDomainData(dataArray);
//     const rms =
//       Math.sqrt(
//         dataArray.reduce((s, v) => s + (v - 128) ** 2, 0) / dataArray.length
//       ) || 0;

//     setNoiseLevel(Math.round(rms));

//     if (rms >= threshold && !talking) {
//       brobotRef.current?.talkStart();
//       talking = true;
//     } else if (rms < threshold && talking) {
//       brobotRef.current?.talkStop();
//       talking = false;
//     }
//     if (!audio.paused) requestAnimationFrame(step);
//   };

//   audio.addEventListener("play", () => requestAnimationFrame(step));
//   audio.addEventListener("ended", () => {
//     brobotRef.current?.talkStop();
//     setNoiseLevel(0);
//   });

//   ctx
//     .resume()
//     .then(() => audio.play())
//     .catch(console.error);
// }

// export default function AI() {
//   const [messages, setMessages] = useState([]);
//   const [textInput, setTextInput] = useState("");
//   const [isRecording, setIsRecording] = useState(false);
//   const [noiseLevel, setNoiseLevel] = useState(0);

//   const brobotRef = useRef(null);
//   const messageEndRef = useRef(null);

//   const recorderFns = useRef({ start: () => {}, stop: () => {} });
//   const clicksRef = useRef(0);
//   const clickTimerRef = useRef(null);

//   /* auto-scroll */
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   /* הודעות */
//   const addMessage = (
//     text,
//     sender,
//     type = "regular",
//     data = null,
//     action = {}
//   ) => setMessages((p) => [...p, { text, sender, type, data, action }]);

//   const removeLoadingMessage = () =>
//     setMessages((p) => p.filter((m) => m.type !== "loading"));

//   /* Brobot click */
//   const handleBrobotClick = useCallback(() => {
//     if (isRecording) {
//       recorderFns.current.stop();
//       setIsRecording(false);
//       clicksRef.current = 0;
//       clearTimeout(clickTimerRef.current);
//       clickTimerRef.current = null;
//       return;
//     }

//     clicksRef.current += 1;
//     if (!clickTimerRef.current) {
//       clickTimerRef.current = setTimeout(() => {
//         clicksRef.current = 0;
//         clickTimerRef.current = null;
//       }, 2000);
//     }
//     if (clicksRef.current === 3) {
//       recorderFns.current.start();
//       setIsRecording(true);
//     }
//   }, [isRecording]);

//   /* submit text */
//   const handleOnSubmit = async (e) => {
//     e.preventDefault();
//     if (!textInput.trim()) return;

//     const userText = textInput.trim();
//     setTextInput("");
//     addMessage(userText, "user");
//     addMessage("… טוען תשובה", "loading", "loading");

//     try {
//       const res = await fetch(`${DOMAIN}/api/v1/ai/ai-response-v4`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: userText }),
//       });

//       removeLoadingMessage();
//       const { aiResponse } = await res.json();
//       const {
//         messageToUser = "",
//         messageType = "regular",
//         actions = {},
//         data = null,
//       } = aiResponse || {};

//       const sender = messageType === "regular" ? "assistant" : "operation";
//       addMessage(messageToUser, sender, messageType, data, actions);

//       if (messageToUser) {
//         const utter = new SpeechSynthesisUtterance(messageToUser);
//         utter.lang = "he-IL";
//         utter.rate = 1;
//         utter.voice =
//           (await getVoices()).find((v) => v.lang === "he-IL") ||
//           (await getVoices())[0];

//         utter.onstart = () => brobotRef.current?.talkStart();
//         utter.onend = () => brobotRef.current?.talkStop();
//         speechSynthesis.cancel();
//         speechSynthesis.speak(utter);
//       }
//     } catch (err) {
//       console.error(err);
//       removeLoadingMessage();
//       addMessage("⚠️ ארעה שגיאה. נסה שוב.", "assistant");
//     }
//   };

//   /* when recording stops */
//   const handleRecordingStop = async (blobUrl) => {
//     try {
//       const audioBlob = await fetch(blobUrl).then((r) => r.blob());
//       const audioFile = new File([audioBlob], "voice.wav", {
//         type: "audio/wav",
//       });
//       const formData = new FormData();
//       formData.append("file", audioFile);

//       addMessage("⌛️ מעלה את ההקלטה…", "user", "loading");

//       const res = await fetch(`${DOMAIN}/api/v1/ai/ai-response-v5`, {
//         method: "POST",
//         body: formData,
//       });

//       removeLoadingMessage();

//       const { aiResponse } = await res.json();
//       const {
//         requestText = "",
//         messageType = "regular",
//         messageToUser = "",
//         actions = {},
//         data = null,
//         audioRoute,
//       } = aiResponse || {};

//       if (requestText) addMessage(requestText, "user");
//       const sender = messageType === "regular" ? "assistant" : "operation";
//       addMessage(messageToUser, sender, messageType, data, actions);

//       if (audioRoute)
//         playAudioWithMouthSync(
//           `${DOMAIN}/${audioRoute}`,
//           brobotRef,
//           setNoiseLevel
//         );
//     } catch (err) {
//       console.error(err);
//       removeLoadingMessage();
//       addMessage("⚠️ שגיאה בעיבוד ההקלטה.", "assistant");
//     }
//   };

//   /* reset */
//   const handleReset = async () => {
//     setMessages([]);
//     setTextInput("");
//     setNoiseLevel(0);
//     await fetch(`${DOMAIN}/api/v1/ai/reset`, { method: "POST" });
//   };

//   /* render */
//   return (
//     <Fragment>
//       <ReactMediaRecorder
//         audio
//         onStop={handleRecordingStop}
//         render={({ startRecording, stopRecording }) => {
//           recorderFns.current.start = startRecording;
//           recorderFns.current.stop = stopRecording;
//           return null;
//         }}
//       />

//       <div className="ai-container">
//         <NeuronBackground />

//         <div onClick={handleBrobotClick}>
//           <Brobot ref={brobotRef} />
//         </div>

//         {/* מד רעש מהרמקול */}
//         <div className="noise-meter">{noiseLevel}</div>

//         {/* הודעות */}
//         <div className="messages-container">
//           {messages.map((m, i) => (
//             <MessageItem
//               key={i}
//               message={m.text}
//               sender={m.sender}
//               type={m.type}
//               data={m.data}
//               action={m.action}
//             />
//           ))}
//           <div ref={messageEndRef} />
//         </div>

//         {/* קלט טקסט */}
//         <div className="user-text-box">
//           <form onSubmit={handleOnSubmit}>
//             <textarea
//               value={textInput}
//               onChange={(e) => setTextInput(e.target.value)}
//               placeholder="...הקלד הודעה"
//               dir="auto"
//               onFocus={() => brobotRef.current?.look("down")}
//               onBlur={() => brobotRef.current?.look("center")}
//             />
//             <button type="submit">שלח</button>
//             <button type="button" onClick={handleReset}>
//               אפס
//             </button>
//           </form>
//         </div>
//       </div>
//     </Fragment>
//   );
// }

import React, {
  useState,
  useEffect,
  useRef,
  // useCallback,
  Fragment,
} from "react";
import { ReactMediaRecorder } from "react-media-recorder-2";
import { DOMAIN } from "../../constants";
import "./AI.css";
import MessageItem from "./MessageItem/MessageItem";
import NeuronBackground from "./NeuronBackground";
import Brobot from "../Brobot/Brobot";

/* ---------------------------------------------------------- */
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
function playAudioWithMouthSync(url, brobotRef, setSpkLevel, currentAudioRef) {
  const audio = new Audio(url);
  currentAudioRef.current = audio; // נשמור כדי שנוכל לעצור
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
  const threshold = 2; // ← מדבר כש‑RMS ≥ 2

  const step = () => {
    analyser.getByteTimeDomainData(dataArray);
    const rms =
      Math.sqrt(
        dataArray.reduce((s, v) => s + (v - 128) ** 2, 0) / dataArray.length
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

  audio.addEventListener("play", () => requestAnimationFrame(step));
  audio.addEventListener("ended", () => {
    brobotRef.current?.talkStop();
    setSpkLevel(0);
  });

  ctx
    .resume()
    .then(() => audio.play())
    .catch(console.error);
}

export default function AI() {
  /* ------------------------------------------------------ */
  /*      מצבי־תצוגה                                        */
  /* ------------------------------------------------------ */
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const [micLevel, setMicLevel] = useState(0); // מד מיקרופון
  const [spkLevel, setSpkLevel] = useState(0); // מד רמקול

  const [micThreshold, setMicThreshold] = useState(30); // 1‑20 מומלץ

  /* ------------------------------------------------------ */
  /*      רפרנסים                                          */
  /* ------------------------------------------------------ */
  const brobotRef = useRef(null);
  const messageEndRef = useRef(null);
  const recorderFns = useRef({ start: () => {}, stop: () => {} });
  const currentAudioRef = useRef(null); // נשמור אודיו פעיל כדי לעצור

  const quietSinceRef = useRef(null); // למדידות שקט

  /* ------------------------------------------------------ */
  /*      גלילה אוטומטית                                    */
  /* ------------------------------------------------------ */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------------------------------------------ */
  /*      ניהול הודעות                                      */
  /* ------------------------------------------------------ */
  const addMessage = (
    text,
    sender,
    type = "regular",
    data = null,
    action = {}
  ) => setMessages((p) => [...p, { text, sender, type, data, action }]);

  const removeLoadingMessage = () =>
    setMessages((p) => p.filter((m) => m.type !== "loading"));

  /* ------------------------------------------------------ */
  /*      טריגר‑קליק ע"ג ברובוט                             */
  /* ------------------------------------------------------ */
  // const clicksRef = useRef(0);
  // const clickTimerRef = useRef(null);

  // const handleBrobotClick = useCallback(() => {
  //   if (isRecording) {
  //     recorderFns.current.stop();
  //     setIsRecording(false);
  //     clicksRef.current = 0;
  //     clearTimeout(clickTimerRef.current);
  //     clickTimerRef.current = null;
  //     return;
  //   }

  //   clicksRef.current += 1;
  //   if (!clickTimerRef.current) {
  //     clickTimerRef.current = setTimeout(() => {
  //       clicksRef.current = 0;
  //       clickTimerRef.current = null;
  //     }, 2000);
  //   }
  //   if (clicksRef.current === 3) {
  //     recorderFns.current.start();
  //     setIsRecording(true);
  //   }
  // }, [isRecording]);

  /* ------------------------------------------------------ */
  /*      טריגר‑קול (מיקרופון)                              */
  /* ------------------------------------------------------ */
  useEffect(() => {
    let ctx, analyser, dataArray, rafId;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
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
                dataArray.length
            ) || 0;

          setMicLevel(Math.round(rms));

          /* --- START recording --- */
          if (!isRecording && rms >= micThreshold) {
            // אם יש אודיו מנגן – לעצור
            currentAudioRef.current?.pause?.();
            speechSynthesis.cancel();

            recorderFns.current.start();
            setIsRecording(true);
            quietSinceRef.current = null;
          }

          /* --- STOP recording (1 שנ׳ שקט ≤ 1) --- */
          if (isRecording) {
            if (rms <= 1) {
              if (!quietSinceRef.current) quietSinceRef.current = Date.now();
              else if (Date.now() - quietSinceRef.current >= 1000) {
                recorderFns.current.stop();
                setIsRecording(false);
                quietSinceRef.current = null;
              }
            } else {
              quietSinceRef.current = null; // חזר רעש
            }
          }

          rafId = requestAnimationFrame(loop);
        };

        ctx.resume().then(loop);
      })
      .catch(console.error);

    return () => {
      cancelAnimationFrame(rafId);
      ctx?.close();
    };
  }, [isRecording, micThreshold]);

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

      if (messageToUser) {
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
      addMessage("⚠️ ארעה שגיאה. נסה שוב.", "assistant");
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

      addMessage("⌛️ מעלה את ההקלטה…", "user", "loading");

      const res = await fetch(`${DOMAIN}/api/v1/ai/ai-response-v5`, {
        method: "POST",
        body: formData,
      });

      removeLoadingMessage();

      const { aiResponse } = await res.json();
      const {
        requestText = "",
        messageType = "regular",
        messageToUser = "",
        actions = {},
        data = null,
        audioRoute,
      } = aiResponse || {};

      if (requestText) addMessage(requestText, "user");
      const sender = messageType === "regular" ? "assistant" : "operation";
      addMessage(messageToUser, sender, messageType, data, actions);

      if (audioRoute)
        playAudioWithMouthSync(
          `${DOMAIN}/${audioRoute}`,
          brobotRef,
          setSpkLevel,
          currentAudioRef
        );
    } catch (err) {
      console.error(err);
      removeLoadingMessage();
      addMessage("⚠️ שגיאה בעיבוד ההקלטה.", "assistant");
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
      {/* --- הקלטה --- */}
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

        {/* ברובוט */}
        {/* <div onClick={handleBrobotClick}> */}
        <div>
          <Brobot ref={brobotRef} />
        </div>

        {/* מדים */}
        <div className="meters">
          <div className="mic-meter">🎙️ {micLevel}</div>
          <div className="spk-meter">🔈 {spkLevel}</div>
        </div>

        {/* סף מיקרופון */}
        <div className="threshold-control">
          <label>
            סף מיקרופון&nbsp;
            <input
              type="range"
              min="1"
              max="50"
              value={micThreshold}
              onChange={(e) => setMicThreshold(+e.target.value)}
            />
            &nbsp;({micThreshold})
          </label>
        </div>

        {/* הודעות */}
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

        {/* קלט טקסט */}
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
