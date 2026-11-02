/* Kept for the Scraper / ProductListServer pages. Every product image now
   comes from the same server endpoint, so this is simply the shared
   component (skeleton + cache-aware) under its old name. */
import ProductImageDisplay from "./ProductImageService";

function ServerProductImage(props) {
  return <ProductImageDisplay {...props} />;
}

export default ServerProductImage;
