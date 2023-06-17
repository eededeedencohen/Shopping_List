import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import "./AudioRecorder.css";
import Microphone from "./microphone.svg";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (blobUrl) => {
    setIsRecording(false);
    downloadBlob(blobUrl);
  };

  const downloadBlob = async (blobUrl) => {
    const audioBlob = await fetch(blobUrl).then((r) => r.blob());
    const audioFile = new File([audioBlob], "voice.wav", { type: "audio/wav" });
    const formData = new FormData(); 

    formData.append("file", audioFile);
    const response = await fetch(
      "http://localhost:8000/api/v1/voice-assistant/blob", 
      {
        method: "POST",
        body: formData,
      }
    );
    const { text, route } = await response.json();
    console.log(text);
    const url = "http://localhost:8000/" + route;
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="voice-assistant">
      <div className="message-area"></div>
      <div className="record-area">
        <ReactMediaRecorder
          audio
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          render={({ startRecording, stopRecording }) => (
            <button
              className={`record-area__button ${
                isRecording ? "recording" : ""
              }`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
            >
              <img src={Microphone} alt="Microphone icon" />
            </button>
          )}
        />
      </div>
    </div>
  );
};

export default AudioRecorder;
