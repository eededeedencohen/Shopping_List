// import React, { useRef, useState } from "react";

// function VoiceAssistant() {
//   const mediaRecorderRef = useRef(null);
//   const [recording, setRecording] = useState(false);
//   const [audioBlob, setAudioBlob] = useState(null);

//   const handleStartRecording = () => {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(stream => {
//         mediaRecorderRef.current = new MediaRecorder(stream);
//         mediaRecorderRef.current.start();

//         const audioChunks = [];
//         mediaRecorderRef.current.addEventListener("dataavailable", event => {
//           audioChunks.push(event.data);
//         });

//         mediaRecorderRef.current.addEventListener("stop", () => {
//           const blob = new Blob(audioChunks, { type: 'audio/mp3' });
//           setAudioBlob(blob);
//         });

//         setRecording(true);
//       });
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//     }
//   };

//   const handleUpload = async () => {
//     const formData = new FormData(); // Create new FormData
//     formData.append('audio', audioBlob, 'temp.mp3'); // Append audio blob to FormData
  
//     const response = await fetch("http://localhost:8000/api/v1/carts/audio", {
//       method: "POST",
//       body: formData // Use FormData as body
//     });
  
//     if (!response.ok) {
//       console.error("Upload failed");
//       return;
//     }
  
//     console.log("Uploaded");
//   };
  

//   return (
//     <div>
//       <button onClick={handleStartRecording} disabled={recording}>
//         Start Recording
//       </button>
//       <button onClick={handleStopRecording} disabled={!recording}>
//         Stop Recording
//       </button>
//       <audio src={audioBlob ? URL.createObjectURL(audioBlob) : ''} controls />
//       <button onClick={handleUpload} disabled={!audioBlob}>
//         Upload
//       </button>
//     </div>
//   );
// }

// export default VoiceAssistant;
