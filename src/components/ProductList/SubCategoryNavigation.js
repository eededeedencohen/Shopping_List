// import React, { useEffect, useRef } from 'react';
// import { useProducts } from '../../context/ProductContext';
// import './SubCategoryNavigation.css';

// export default function SubCategoryNavigation() {
//   const {
//     all_sub_categories,
//     activeCategoryIndex,
//     activeSubCategoryIndex,
//     setActiveSubCategoryIndex,
//   } = useProducts();

//   const navigationRef = useRef(null);

//   // המערך של תתי־הקטגוריות עבור הקטגוריה הפעילה
//   const subCats = all_sub_categories[activeCategoryIndex] || [];

//   const handleSubClick = (index) => {
//     setActiveSubCategoryIndex(index);
//     scrollToSub(index);
//   };

//   const scrollToSub = (index) => {
//     if (!navigationRef.current) return;
//     const element = navigationRef.current.children[index];
//     if (!element) return;
//     const containerWidth = navigationRef.current.clientWidth;
//     const scrollX =
//       element.offsetLeft - (containerWidth / 2 - element.clientWidth / 2);
//     navigationRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToSub(activeSubCategoryIndex);
//   }, [activeSubCategoryIndex]);

//   // אם אין תתי־קטגוריות בכלל, לא נציג כלום
//   if (!subCats.length) return null;

//   return (
//     <div className="sub-navigation" ref={navigationRef}>
//       {subCats.map((subCat, index) => (
//         <div
//           key={index}
//           className={`sub-nav-topic ${
//             index === activeSubCategoryIndex ? 'active-sub-topic' : ''
//           }`}
//           onClick={() => handleSubClick(index)}
//         >
//           {subCat}
//           {index === activeSubCategoryIndex && (
//             <div className="sub-nav-underline" />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// SubCategoryNavigation.js

// SubCategoryNavigation.js
import React, { useEffect, useRef } from 'react';
import { useProducts } from '../../context/ProductContext';
import './SubCategoryNavigation.css';

/**
 * רכיב שמציג את התתי־קטגוריות של הקטגוריה הפעילה.
 * פס גלילה דומה, עם אפשרות ללחוץ ולעבור לתת־קטגוריה אחרת.
 */
export default function SubCategoryNavigation() {
  const {
    all_sub_categories,
    activeCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProducts();

  const navigationRef = useRef(null);

  // מביאים את המערך של התתי־קטגוריות עבור הקטגוריה הפעילה
  const subCats = all_sub_categories[activeCategoryIndex] || [];

  const handleSubClick = (index) => {
    setActiveSubCategoryIndex(index);
    scrollToSub(index);
  };

  const scrollToSub = (index) => {
    if (!navigationRef.current) return;
    const element = navigationRef.current.children[index];
    if (!element) return;

    const containerWidth = navigationRef.current.clientWidth;
    const scrollX =
      element.offsetLeft - (containerWidth / 2 - element.clientWidth / 2);
    navigationRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
  };

  // בכל שינוי של תת־קטגוריה פעילה, לגלול אליה
  useEffect(() => {
    scrollToSub(activeSubCategoryIndex);
  }, [activeSubCategoryIndex]);

  // אם אין תתי-קטגוריות, לא מציגים כלום
  if (!subCats.length) return null;

  return (
    <div className="sub-navigation" ref={navigationRef}>
      {subCats.map((subCat, index) => (
        <div
          key={index}
          className={`sub-nav-topic ${
            index === activeSubCategoryIndex ? 'active-sub-topic' : ''
          }`}
          onClick={() => handleSubClick(index)}
        >
          {subCat}
          {index === activeSubCategoryIndex && (
            <div className="sub-nav-underline" />
          )}
        </div>
      ))}
    </div>
  );
}

