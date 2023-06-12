import React, { useState } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (blobUrl) => {
    setIsRecording(false);
    setBlobUrl(blobUrl);
    downloadBlob(blobUrl);
  };

  const downloadBlob = (url) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'recorded_audio.mp3';
    anchor.click();
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      <ReactMediaRecorder
        audio
        mimeType="audio/mp3"
        onStart={handleStartRecording}
        onStop={handleStopRecording}
        render={({ startRecording, stopRecording }) => (
          <div>
            {!isRecording ? (
              <button onClick={startRecording}>Start Recording</button>
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
  );
};

export default AudioRecorder;
