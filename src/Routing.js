import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import PriceList from "./components/PriceList/PriceList";
import Cart from "./components/Cart/Cart";
import ImageParser from "./components/ImageParser/ImageParser";
import VoiceAssistant from "./components/VoiceAssistant/VoiceAssistant";
import React from "./components/Rachel/Rachel";
import AudioUploader from "./components/Recorder/Recorder";
import UploadRecord from "./components/UploadRecord/UploadRecord";
import AudioRecorder from "./components/UploadRecord/AudioRecorder";
import httpClient from "./network";
import { useEffect, useState } from "react";

const UploadFile = () => {
  const [file, setFile] = useState();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const stringBase64 = reader.result;
      };

      reader.readAsDataURL(file); // base64
    }
  }, [file]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fileFRomForm = e.target[0].files[0];
          setFile(fileFRomForm);
          // httpClient.post("/uploadFile", file);
        }}
      >
        <input type="file" />
        <button type="submit">Send file to server</button>
      </form>
    </div>
  );
};
function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/priceList/:barcode" element={<PriceList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/FilePickTest" element={<UploadFile />} />
      <Route path="/image-parser" element={<ImageParser />} />
      <Route path="/voice-assistant" element={<VoiceAssistant />} />
      <Route path="/rachel" element={<React />} />
      <Route path="/audio-uploader" element={<AudioUploader />} />
      <Route path="/upload-record" element={<UploadRecord />} />
      <Route path="/audio-recorder" element={<AudioRecorder />} />
    </Routes>
  );
}

export default Routing;
