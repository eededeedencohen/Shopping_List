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
/**
 *
 * @returns {Promise<SpeechSynthesisVoice[]>} A promise that resolves to
 * the list of available speech synthesis voices.
 * the structure of SpeechSynthesisVoice is:
 * {
 *  voiceURI: string,
 * name: string,
 * lang: string,
 * localService: boolean,
 * default: boolean
 * }
 */
const getVoices = () =>
  new Promise((resolve) => {
    const cached = speechSynthesis.getVoices(); //
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
    isAiSpeakingRef.current = true; // 🔒 נועל הקלטה
    console.log("%c🔊 AI is speaking...", "color: cyan");
    requestAnimationFrame(step);
  });

  audio.addEventListener("ended", () => {
    brobotRef.current?.talkStop();
    setSpkLevel(0);
    isAiSpeakingRef.current = false; // 🔓 משחרר הקלטה
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

  const brobotRef = useRef(null);
  const messageEndRef = useRef(null);
  const recorderFns = useRef({ start: () => {}, stop: () => {} });
  const currentAudioRef = useRef(null);
  const quietSinceRef = useRef(null);
  const recordingLock = useRef(false);
  const isAiSpeakingRef = useRef(false); // 🧠 האם ה-AI מדבר כרגע

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

  /* ------------------------------------------------------ */
  /*      טריגר-קול (מיקרופון)                              */
  /* ------------------------------------------------------ */
  useEffect(() => {
    console.log("Microphone effect running");
    let ctx, analyser, dataArray, rafId, stream;

    navigator.mediaDevices // browser API
      .getUserMedia({
        audio: {
          echoCancellation: true, // ביטול הד - למנוע מהמיקרופון לשמוע את הרמקולים
          noiseSuppression: true, // ביטול רעשי רקע
          autoGainControl: true, // התאמה אוטומטית של עוצמת הקול
        },
      }) // request mic access
      // after access granted:
      .then((mediaStream) => {
        stream = mediaStream; // שמירת ה-stream כדי לעצור אותו ב-cleanup
        // strean is the live mic data
        ctx = new (window.AudioContext || window.webkitAudioContext)(); // audio context - in short "the audio system"
        const src = ctx.createMediaStreamSource(stream); // source from mic

        analyser = ctx.createAnalyser(); // create an analyser node for real-time analysis like reading wave in real-time, spectrum measurements etc.
        analyser.fftSize = 2048; // set FFT size. FFT is just a way to analyze sound
        src.connect(analyser); // connect source to analyser
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
          analyser.getByteTimeDomainData(dataArray); // assign current data to dataArray
          const rms = // Root Mean Square
            Math.sqrt(
              dataArray.reduce((s, v) => s + (v - 128) ** 2, 0) /
                dataArray.length,
            ) || 0;

          setMicLevel(Math.round(rms));
          // עדכון Brobot עם רמת המיקרופון בזמן אמת
          if (isRecording) {
            brobotRef.current?.updateRecLevel(Math.round(rms));
          }

          // ✅ תנאי חדש - לא להתחיל הקלטה כשה-AI מדבר
          if (
            !isRecording &&
            rms >= micThreshold &&
            !recordingLock.current &&
            !isAiSpeakingRef.current
          ) {
            console.log("%c🎙️ START recording", "color: lime");
            recordingLock.current = true;
            currentAudioRef.current?.pause?.(); // pause any current audio playback
            speechSynthesis.cancel(); // stop any ongoing TTS - cancel all queued utterances
            recorderFns.current.start(); // start recording
            setIsRecording(true); // update state to indicate recording has started
            brobotRef.current?.recordStart(); // 🎙️ הצגת אינדיקטור הקלטה ב-Brobot
            quietSinceRef.current = null; // reset quiet timer - reset the quiet timer - ignore any previous quiet time
          }

          if (isRecording) {
            if (rms <= 1) {
              if (!quietSinceRef.current) quietSinceRef.current = Date.now();
              // start quiet timer if not already started
              else if (Date.now() - quietSinceRef.current >= 1000) {
                console.log("%c⏹ STOP recording", "color: red");
                recorderFns.current.stop();
                setIsRecording(false);
                brobotRef.current?.recordStop(); // ⏹️ הסתרת אינדיקטור הקלטה ב-Brobot
                quietSinceRef.current = null;
                // הנעילה תישאר עד לתשובה מהשרת
              }
            } else {
              quietSinceRef.current = null;
            }
          }

          rafId = requestAnimationFrame(loop);
        };

        ctx.resume().then(loop);
      })
      .catch(console.error);

    return () => {
      console.log("%c🛑 Cleaning up microphone", "color: orange");
      cancelAnimationFrame(rafId);
      ctx?.close();
      // עצירת כל ה-tracks (המיקרופון) כשיוצאים מהעמוד
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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
          currentAudioRef,
          isAiSpeakingRef, // ← חדש
        );

      // 🔓 משחרר נעילה אחרי תשובה מהשרת
      recordingLock.current = false;
      console.log("%c🔓 UNLOCKED after server response", "color: green");
    } catch (err) {
      console.error(err);
      removeLoadingMessage();
      addMessage("⚠️ שגיאה בעיבוד ההקלטה.", "assistant");

      // 🔓 משחרר נעילה גם במקרה של שגיאה
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

        <div>
          <Brobot ref={brobotRef} />
        </div>

        <div className="meters">
          <div className="mic-meter">🎙️ {micLevel}</div>
          <div className="spk-meter">🔈 {spkLevel}</div>
        </div>

        <div className="threshold-control">
          <label>
            סף מיקרופון&nbsp;
            <input
              type="range"
              min="1"
              max="200"
              value={micThreshold}
              onChange={(e) => {
                setMicThreshold(+e.target.value);
                console.log(
                  "Microphone threshold changed to:",
                  +e.target.value,
                );
              }}
            />
            &nbsp;({micThreshold})
          </label>
        </div>

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
