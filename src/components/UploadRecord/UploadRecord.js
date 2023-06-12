// import { useState } from "react";
// import storage from "./firebase";
// import { AudioRecorder } from "react-audio-voice-recorder";

// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// const UploadRecord = () => {
//   const handleRecordingComplete = async (blob) => {
//     try {
//       const storageRef = ref(storage, `/audio/${Date.now()}.mp3`);
//       const uploadTask = uploadBytesResumable(storageRef, blob);

//       uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//           const percent = Math.round(
//             (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//           );
//           console.log(`Upload progress: ${percent}%`);
//         },
//         (error) => {
//           console.log("Upload error:", error);
//         },
//         () => {
//           getDownloadURL(uploadTask.snapshot.ref)
//             .then((url) => {
//               console.log("Download URL:", url);
//             })
//             .catch((error) => {
//               console.log("Error getting download URL:", error);
//             });
//         }
//       );
//     } catch (error) {
//       console.log("Error uploading audio:", error);
//     }
//   };

//   return (
//     <div>
//       <AudioRecorder
//         onRecordingComplete={handleRecordingComplete}
//         audioTrackConstraints={{
//           noiseSuppression: true,
//           echoCancellation: true,
//         }}
//         downloadOnSavePress={true}
//         downloadFileExtension="mp3"
//       />
//     </div>
//   );
// };

// export default UploadRecord

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
import React, { useState } from "react";

function UploadRecord() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState(null);

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:8000/api/v1/voice-assistent/text", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      console.error("Upload failed");
      return;
    }

    const result = await response.json();
    setText(result.data.text);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        <button type="submit">Upload</button>
      </form>
      {text && <p>Detected text: {text}</p>}
      
    </div>
  );
}

export default UploadRecord;







// import React, { useState } from "react";
// import { ReactMediaRecorder } from "react-media-recorder";

// function UploadRecord() {
//   const [text, setText] = useState(null);

//   const handleRecordingComplete = (blob) => {
//     uploadAudio(blob);
//   };

//   const uploadAudio = async (blob) => {
//     const formData = new FormData();
//     formData.append("audio", blob);

//     const response = await fetch("http://localhost:8000/api/v1/voice-assistent/text", {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       console.error("Upload failed");
//       return;
//     }

//     const result = await response.json();
//     setText(result.data.text);
//   };

//   return (
//     <div>
//       <ReactMediaRecorder
//         audio
//         onStop={handleRecordingComplete}
//         render={({ startRecording, stopRecording }) => (
//           <div>
//             <button onClick={startRecording}>Start Recording</button>
//             <button onClick={stopRecording}>Stop Recording</button>
//           </div>
//         )}
//       />
//       {text && <p>Detected text: {text}</p>}
//     </div>
//   );
// }

// export default UploadRecord;

