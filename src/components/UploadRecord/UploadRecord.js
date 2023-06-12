import { useState } from "react";
import storage from "./firebase";
import { AudioRecorder } from "react-audio-voice-recorder";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
const UploadRecord = () => {
  const handleRecordingComplete = async (blob) => {
    try {
      const storageRef = ref(storage, `/audio/${Date.now()}.mp3`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log(`Upload progress: ${percent}%`);
        },
        (error) => {
          console.log("Upload error:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url) => {
              console.log("Download URL:", url);
            })
            .catch((error) => {
              console.log("Error getting download URL:", error);
            });
        }
      );
    } catch (error) {
      console.log("Error uploading audio:", error);
    }
  };

  return (
    <div>
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        downloadOnSavePress={true}
        downloadFileExtension="mp3"
      />
    </div>
  );
};

export default UploadRecord