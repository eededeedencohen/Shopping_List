import React from "react";
import fruitsAndVegetablesImg from "./CatagoryImages/fruitsAndVegetables.jpg";
import meatChickenAndFishImg from "./CatagoryImages/meatChickenAndFish.jpg";
import milkAndEggsImg from "./CatagoryImages/milkAndEggs.jpg";
import breadAndPastriesImg from "./CatagoryImages/breadAndPastries.jpg";
import drinksWineAndAlcoholImg from "./CatagoryImages/drinksWineAndAlcohol.jpg";
import frozenProductsImg from "./CatagoryImages/frozenProducts.jpg";
import cookingAndBakingImg from "./CatagoryImages/cookingAndBaking.jpg";
import canningImg from "./CatagoryImages/canning.jpg";
import snacksSweetsAndCerealsImg from "./CatagoryImages/snacksSweetsAndCereals.jpg";
import cleaningAndDisposableImg from "./CatagoryImages/cleaningAndDisposable.jpg";
import pharmacyAndBabiesImg from "./CatagoryImages/pharmacyAndBabies.jpg";
import "./CategoryList.css";
// import other images similarly
// import { useCart } from "../../../context/CartContext";

const onclickCategoryHandle = (category) => {
  console.log(category);
};

const categoryDictionary = {
  "פירות וירקות": { imageName: fruitsAndVegetablesImg },
  "בשר עוף, ודגים": { imageName: meatChickenAndFishImg }, 
  "מוצרי חלב וביצים": { imageName: milkAndEggsImg }, 
  "לחמים ומאפים": { imageName: breadAndPastriesImg }, 
  "משקאות, יין ואלכוהול": { imageName: drinksWineAndAlcoholImg }, 
  "מוצרים קפואים": { imageName: frozenProductsImg },
  "בישול ואפייה": { imageName: cookingAndBakingImg },
  "שימורים": { imageName: canningImg }, 
  "חטיפים, מתוקים ודגנים": { imageName: snacksSweetsAndCerealsImg },
  "ניקיון וחד פעמי": { imageName: cleaningAndDisposableImg },
  "פארם ותינוקות": { imageName: pharmacyAndBabiesImg },
};

export default function CategoryList() {
  return (
    <div className="category-container">
      {Object.entries(categoryDictionary).map(([category, { imageName }]) => (
        <div
          className="category-item"
          key={category}
          onClick={() => onclickCategoryHandle(category)}
        >
          <img src={imageName} alt={category} />
          <p>{category}</p>
        </div>
      ))}
    </div>
  );
}
