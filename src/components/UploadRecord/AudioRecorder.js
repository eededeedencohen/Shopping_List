// import React, { useState } from "react";
// import { ReactMediaRecorder } from "react-media-recorder";
// import "./AudioRecorder.css";

// const AudioRecorder = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [blobUrl, setBlobUrl] = useState("");

//   const handleStartRecording = () => {
//     setIsRecording(true);
//   };

//   const handleStopRecording = (blobUrl) => {
//     setIsRecording(false);
//     setBlobUrl(blobUrl);
//     downloadBlob(blobUrl);
//   };

//   const downloadBlob = (url) => {
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = "recorded_audio.mp3";
//     anchor.click();
//   };

//   return (
//     <div className="audio_recorder" >
//       <h2>Audio Recorder</h2>
//       <div className="recording">
//         <ReactMediaRecorder
//           audio
//           mimeType="audio/mp3"
//           onStart={handleStartRecording}
//           onStop={handleStopRecording}
//           render={({ startRecording, stopRecording }) => (
//             <div>
//               {!isRecording ? (
//                 <>
//             <button className="record-btn" onClick={startRecording}>
//                     !
//                   </button>
//                 <div className="ocean">

//                   <div className="wave"></div>
//                   <div className="wave"></div>

//                 </div>
//                 </>
//               ) : (
//                 <button onClick={stopRecording}>Stop Recording</button>
//               )}
//             </div>
//           )}
//         />
//         {blobUrl && (
//           <div>
//             <audio src={blobUrl} controls />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AudioRecorder;

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

  const downloadBlob = async (blobUrl) => {
    console.log("url", blobUrl);
    const audioBlob = await fetch(blobUrl).then((r) => r.blob());
    const audioFile = new File([audioBlob], "voice.wav", { type: "audio/wav" });
    const formData = new FormData(); // preparing to send to the server

    formData.append("file", audioFile);
    const response = await fetch(
      "http://localhost:8000/api/v1/voice-assistant/blob",
      {
        method: "POST",
        body: formData,
      }
    );
    const { text, route } = await response.json();
    //const recording = new SpeechSynthesisUtterance(text);
    //window.speechSynthesis.speak(recording);
    console.log({ route });
    const url = "http://localhost:8000/" + route;
    const audio = new Audio(url);
    audio.play();
    // const anchor = document.createElement("a");
    // anchor.href = blobUrl;
    // anchor.download = "recorded_audio.webm"; // changed extension
    // anchor.click();
  };

  return (
    <div className="audio_recorder">
      <h2>Audio Recorder</h2>
      <div className="recording">
        <ReactMediaRecorder
          audio
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
