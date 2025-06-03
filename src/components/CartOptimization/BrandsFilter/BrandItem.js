// import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";
import {
  useSettings,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";
import "./BrandItem.css";

const BrandItem = ({ brand, barcode }) => {
  const { getBlackListBrands } = useSettings();
  const { insertBrandToBlackList, removeBrandFromBlackList } =
    useSettingsOperations();

  // id ייחודי לכל צ'ק-בוקס כדי לקשר את <label> ל-<input>
  const checkboxId = `brand-${barcode}-${brand}`;

  const isAllowed = !getBlackListBrands(barcode).includes(brand);

  const handleChange = () =>
    isAllowed
      ? insertBrandToBlackList(barcode, brand) // היה ברשימה הלבנה → הוסף לרשימה השחורה
      : removeBrandFromBlackList(barcode, brand); // היה ברשימה השחורה → הסר ממנה

  return (
    <div className="brand-item">
      <div className="brand-item__brand-name">{brand}</div>

      {/* -- עטפנו בקלאס checkbox-wrapper כדי למחזר את ה-CSS המעוצב -- */}
      <div className="brand-item__checkbox checkbox-wrapper">
        <input
          id={checkboxId}
          type="checkbox"
          checked={isAllowed}
          onChange={handleChange}
        />
        <label htmlFor={checkboxId}>
          <span className="tick_mark" />
        </label>
      </div>
    </div>
  );
};

export default BrandItem;
