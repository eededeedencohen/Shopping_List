import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import PriceList from "./components/PriceList/PriceList";
import Cart from "./components/Cart/Cart";
import ImageParser from "./components/ImageParser/ImageParser";
import UploadRecord from "./components/UploadRecord/UploadRecord";
import AudioRecorder from "./components/UploadRecord/AudioRecorder";
import HistoryPage from "./components/History/HistoryPage";
import HistoryList from "./components/History/HistoryList";
import CategoryList from "./components/Cart/Category/CategoryList";
import { Stats } from "./components/Stats/Stats";
import TouchDirection from "./components/Finger/TouchDirection";
import SearchBar from "./components/SearchBar/SearchBar";
import Test from "./components/Test/Test";
import ListProductsSettings from "./components/CartOptimization/ListProductsSettings";
import OptimalCartsSettings from "./components/CartOptimization/OptimalCartsSettings/OptimalCartsSettings";
import OptimalsSupermarketCarts from "./components/CartOptimization/OptimalsSupermarketCarts/OptimalsSupermarketCarts";
import OptimalCart from "./components/CartOptimization/OptimalsSupermarketCarts/OptimalSupermarketCart/OptimalCart";
import ExpenseOverview from "./components/Stats/ExpenseOverview";
// import ProductListManager from "./components/ProductList/ProductListManager";
// import ProductListManagerAlternativeProductsGroups from "./components/ProductList/ProductListManagerAlternativeProductsGroups";
// import EditProducts from "./components/ProductList/EditProducts";
import AI from "./components/AI/AI";
import ProductsListTest from "./components/HooksTest/ProductsListTest";
import CartTest from "./components/HooksTest/CartTest";
import SearchTest from "./components/HooksTest/SearchTest";
import AnimationTest from "./components/AAAnimationTests/AnimationTest";
import AnimationMove from "./components/AAAnimationTests/AnimationMove";
import AnimationTouchMove from "./components/AAAnimationTests/AnimationTouchMove";
import Chatbot from "./components/Design/Chatbot/Chatbot";
import StatsDashboard from "./components/Design/Charts/StatsDashboard";
import ProductsListGroups from "./components/ProductList/ProductListGroups";
// BarcodeScanner
import RobotMascot from "./components/AAAnimationTests/RobotMascot";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
      <Route path="/search" element={<SearchBar />} />
      <Route path="/test" element={<Test />} />
      <Route path="/products-settings" element={<ListProductsSettings />} />
      <Route
        path="/optimal-carts-settings"
        element={<OptimalCartsSettings />}
      />
      <Route
        path="/optimal-supermarket-carts"
        element={<OptimalsSupermarketCarts />}
      />
      <Route
        path="/optimal-supermarket-carts/:supermarketID"
        element={<OptimalCart />}
      />
      <Route path="/expense-overview" element={<ExpenseOverview />} />
      {/* <Route path="/product-list" element={<ProductListManager />} /> */}
      {/* <Route
        path="/alternative-products-groups"
        element={<ProductListManagerAlternativeProductsGroups />}
      /> */}
      {/* <Route path="/edit-products" element={<EditProducts />} /> */}
      <Route path="/ai" element={<AI />} />
      <Route path="/products-list-test" element={<ProductsListTest />} />
      <Route path="/cart-test" element={<CartTest />} />
      <Route path="/search-test" element={<SearchTest />} />
      <Route path="/animation-test" element={<AnimationTest />} />
      <Route path="/animation-move" element={<AnimationMove />} />
      <Route path="/animation-touch-move" element={<AnimationTouchMove />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/stats-dashboard" element={<StatsDashboard />} />
      <Route path="/products-list-groups" element={<ProductsListGroups />} />
      <Route path="/robot" element={<RobotMascot />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default Routing;
