import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import "./AudioRecorder.css";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (blobUrl) => {
    setIsRecording(false);
    setBlobUrl(blobUrl);
    downloadBlob(blobUrl);
  };

  const downloadBlob = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "recorded_audio.mp3";
    anchor.click();
  };

  return (
    <div className="audio_recorder" >
      <h2>Audio Recorder</h2>
      <div className="recording">
        <ReactMediaRecorder
          audio
          mimeType="audio/mp3"
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          render={({ startRecording, stopRecording }) => (
            <div>
              {!isRecording ? (
                <>
            <button className="record-btn" onClick={startRecording}>
                    !
                  </button>
                <div className="ocean">
               
                  <div className="wave"></div>
                  <div className="wave"></div>
               
                </div>
                </>
              ) : (
                <button onClick={stopRecording}>Stop Recording</button>
              )}
            </div>
          )}
        />
        {blobUrl && (
          <div>
            <audio src={blobUrl} controls />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
