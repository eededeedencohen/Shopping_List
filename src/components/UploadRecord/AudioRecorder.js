import React, { useState, useEffect, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder-2";
import Microphone from "./microphone.svg";
import "./AudioRecorder.css";
import { DOMAIN } from "../../constants";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = async (blobUrl) => {
    setIsRecording(false);
    await processRecording(blobUrl);
  };

  const processRecording = async (blobUrl) => {
    const audioBlob = await fetch(blobUrl).then((r) => r.blob());
    const audioFile = new File([audioBlob], "voice.wav", { type: "audio/wav" });
    const formData = new FormData();

    formData.append("file", audioFile);
    const response = await fetch(`${DOMAIN}/api/v1/voice-assistant/blob`, {
      method: "POST",
      body: formData,
    });

    const { requestText, text, route } = await response.json();
    addMessage(requestText, "user"); // User's message
    addMessage(text, "assistant"); // Assistant's response
    playResponse(route);
  };

  const playResponse = (route) => {
    const url = `${DOMAIN}/` + route;
    const audio = new Audio(url);
    audio.play();
  };

  const addMessage = (text, sender) => {
    setMessages((prevMessages) => [...prevMessages, { text, sender }]);
  };

  return (
    <div className="voice-assistant">
      <div className="message-area">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}-message`}>
            {message.text}
          </div>
        ))}
        <div ref={messageEndRef} /> {/* Invisible element for auto-scrolling */}
      </div>
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
              onClick={() => (isRecording ? stopRecording() : startRecording())}
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
