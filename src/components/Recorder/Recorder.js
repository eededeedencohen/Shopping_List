// import React from "react";
// import axios from "axios";
// import { AudioRecorder } from "react-audio-voice-recorder";

// class AudioUploader extends React.Component {
//   addAudioElement = (blob) => {
//     const url = URL.createObjectURL(blob);
//     const audio = document.createElement("audio");
//     audio.src = url;
//     audio.controls = true;
//     document.body.appendChild(audio);

//     // Convert blob to File
//     const file = new File([blob], "recorded_audio.mp3", { type: "audio/mp3" });

//     // Create a FormData instance
//     const formData = new FormData();

//     // Append the file to the form data
//     formData.append("audio", file);

//     // Use Axios to send the audio file to your server
//     axios
//       .post("http://localhost:8000/api/v1/carts/audio", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       .then((response) => {
//         console.log(response);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   };

//   render() {
//     return (
//       <AudioRecorder
//         onRecordingComplete={this.addAudioElement}
//         audioTrackConstraints={{
//           noiseSuppression: true,
//           echoCancellation: true,
//         }}
//         downloadOnSavePress={true}
//         downloadFileExtension="mp3"
//       />
//     );
//   }
// }

// export default AudioUploader;
