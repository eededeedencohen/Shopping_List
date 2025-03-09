// import React, { useEffect, useRef } from 'react';
// import './CategoryNavigation.css'; 
// import { useProducts } from '../../context/ProductContext';

// const CategoryNavigation = () => {
//   const { allCategories, activeCategory, setActiveCategory } = useProducts();
//   const navigationRef = useRef(null);

//   const handleTopicClick = (index) => {
//     setActiveCategory(allCategories[index]);
//     scrollToTopic(index);
//   };

//   const scrollToTopic = (index) => {
//     const topicElement = navigationRef.current.children[index];
//     if (topicElement) {
//       const containerWidth = navigationRef.current.clientWidth;
//       const scrollX = topicElement.offsetLeft - (containerWidth / 2 - topicElement.clientWidth / 2);
//       navigationRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
//     }
//   };

//   useEffect(() => {
//     // Scroll to the active category when it changes
//     const activeIndex = allCategories.indexOf(activeCategory);
//     if (activeIndex !== -1) {
//       scrollToTopic(activeIndex);
//     }
//   }, [activeCategory, allCategories]);

//   return (
//     <div className="mobile-navigation" ref={navigationRef}>
//       {allCategories.map((topic, index) => (
//         <div
//           key={index}
//           className={`navigation-topic ${allCategories[index] === activeCategory ? 'active-topic' : ''}`}
//           onClick={() => handleTopicClick(index)}
//         >
//           {topic}
//           {allCategories[index] === activeCategory && <div className="navigation-topic-underline"></div>}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CategoryNavigation;

//========================================================================
//========================================================================
import React, { useEffect, useRef } from 'react';
import './CategoryNavigation.css'; 
import { useProducts } from '../../context/ProductContext';

const CategoryNavigation = () => {
  const {
    allCategories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProducts();

  const navigationRef = useRef(null);

  /**
   * כשמשתמש לוחץ על קטגוריה - נעבור לקטגוריה (index) הזה, ואנחנו מאפסים את הסאב-קטגוריה ל-0
   */
  const handleTopicClick = (index) => {
    setActiveCategoryIndex(index);
    setActiveSubCategoryIndex(0);
    scrollToTopic(index);
  };

  /**
   * גלילה אנימטיבית של ה־scroll של הרשימה עד שהקטגוריה תהיה במרכז
   */
  const scrollToTopic = (index) => {
    if (!navigationRef.current) return;
    const topicElement = navigationRef.current.children[index];
    if (topicElement) {
      const containerWidth = navigationRef.current.clientWidth;
      const scrollX =
        topicElement.offsetLeft - (containerWidth / 2 - topicElement.clientWidth / 2);
      navigationRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // בכל פעם שהקטגוריה הפעילה משתנה, לגלול אליה
    scrollToTopic(activeCategoryIndex);
  }, [activeCategoryIndex]);

  return (
    <div className="mobile-navigation" ref={navigationRef}>
      {allCategories.map((topic, index) => (
        <div
          key={index}
          className={`navigation-topic ${index === activeCategoryIndex ? 'active-topic' : ''}`}
          onClick={() => handleTopicClick(index)}
        >
          {topic}
          {index === activeCategoryIndex && <div className="navigation-topic-underline"></div>}
        </div>
      ))}
    </div>
  );
};

export default CategoryNavigation;
