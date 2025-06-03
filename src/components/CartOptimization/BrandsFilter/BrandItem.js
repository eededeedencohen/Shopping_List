// import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";
import {
  useSettings,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";
import "./BrandItem.css";

const BrandItem = ({ brand, barcode }) => {
  // const {
  //   getBlackListBrands,
  //   insertBrandToBlackList,
  //   removeBrandFromBlackList,
  // } = useCartOptimizationContext();

  const { getBlackListBrands } = useSettings(); // useSettings

  const { insertBrandToBlackList, removeBrandFromBlackList } =
    useSettingsOperations();

  return (
    <div className="brand-item">
      <div className="brand-item__brand-name">{brand}</div>
      <div className="brand-item__checkbox">
        <input
          type="checkbox"
          checked={!getBlackListBrands(barcode).includes(brand)}
          onChange={() =>
            getBlackListBrands(barcode).includes(brand)
              ? removeBrandFromBlackList(barcode, brand)
              : insertBrandToBlackList(barcode, brand)
          }
        ></input>
      </div>
    </div>
  );
};
export default BrandItem;
