import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import PriceList from "./components/PriceList/PriceList";
import Cart from "./components/Cart/Cart";
import ImageParser from "./components/ImageParser/ImageParser";
import UploadRecord from "./components/UploadRecord/UploadRecord";
import AudioRecorder from "./components/UploadRecord/AudioRecorder";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/priceList/:barcode" element={<PriceList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/image-parser" element={<ImageParser />} />
      <Route path="/upload-record" element={<UploadRecord />} />
      <Route path="/audio-recorder" element={<AudioRecorder />} />
    </Routes>
  );
}

export default Routing;
