import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import PriceList from "./components/PriceList/PriceList";
import ProductsListNew from "./components/ProductList/ProductsListNew";
import Cart from "./components/Cart/Cart";
import ImageParser from "./components/ImageParser/ImageParser";
import UploadRecord from "./components/UploadRecord/UploadRecord";
import AudioRecorder from "./components/UploadRecord/AudioRecorder";
import HistoryPage from "./components/History/HistoryPage";
import HistoryList from "./components/History/HistoryList";
import CategoryList from "./components/Cart/Category/CategoryList";
import { Stats } from "./components/Stats/Stats";
import TouchDirection from "./components/Finger/TouchDirection";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductsListNew />} />
      <Route path="/priceList/:barcode" element={<PriceList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/image-parser" element={<ImageParser />} />
      <Route path="/upload-record" element={<UploadRecord />} />
      <Route path="/audio-recorder" element={<AudioRecorder />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/:id" element={<HistoryList />} />
      <Route path="/category" element={<CategoryList />} />
      <Route path="/finger" element={<TouchDirection />} />
    </Routes>
  );
}

export default Routing;
