// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import Title from "./Title";
// import RecordMessage from "./RecordMessage";
// import "./Controller.css";
// import axios from "axios";

// const Controller = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     console.log("Controller component mounted");
//     return () => console.log("Controller component unmounted");
//   }, []);

//   const createBlobUrl = (data) => {
//     const blob = new Blob([data], { type: "audio/mpeg" });
//     return window.URL.createObjectURL(blob);
//   };

//   const handleStop = async (blobUrl) => {
//     console.log("handleStop called");
//     if (isLoading) {
//       console.log("Preventing duplicate call to handleStop");
//       return;
//     }
//     setIsLoading(true);
//     setErrorMessage("");

//     const myMessage = { sender: "me", blobUrl: blobUrl };
//     const messageArray = [...messages, myMessage];

//     try {
//       const response = await fetch(blobUrl);
//       const blob = await response.blob();
//       const formData = new FormData();
//       formData.append("file", blob, "myFile.wav");

//       const res = await axios.post(
//         "http://localhost:8000/post-audio",
//         formData,
//         {
//           headers: { "Content-Type": "audio/mpeg" },
//         }
//       );

//       const newBlob = res.data;
//       const audio = new Audio();
//       audio.src = createBlobUrl(newBlob);

//       const rachelMessage = { sender: "rachel", blobUrl: audio.src };
//       messageArray.push(rachelMessage);
//       setMessages(messageArray);

//       audio.play();
//     } catch (err) {
//       console.error(err.message);
//       setErrorMessage("Error processing audio. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen overflow-hidden controller">
//       <Title setMessages={setMessages} />
//       {errorMessage && <div className="error-message">{errorMessage}</div>}
//       <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r element">
//         <RecordMessage handleStop={handleStop} />
//       </div>
//     </div>
//   );
// };

// Controller.propTypes = {
//   setMessages: PropTypes.func.isRequired,
// };

// export default Controller;

import React, { useState, useRef } from "react";

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      console.error("Media devices not supported");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setAudioUrl(URL.createObjectURL(event.data));
    }
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioUrl && <audio src={audioUrl} controls />}
    </div>
  );
}

export default AudioRecorder;
