import beImage from "./supermarketsImages/BE.png";
import carrefoutImage from "./supermarketsImages/Carrefour city (קרפור סיטי).png";
import yellowImage from "./supermarketsImages/yellow.png";
import osherAdImage from "./supermarketsImages/אושר עד.png";
import barcolImage from "./supermarketsImages/ברכל.png";

import victoryImage from "./supermarketsImages/ויקטורי.png";
import bigAndCheapImage from "./supermarketsImages/זול ובגדול.png";
import yohananofImage from "./supermarketsImages/יוחננוף.png";
import thereInNeighborhoodImage from "./supermarketsImages/יש בשכונה.png";
import chesedExistsImage from "./supermarketsImages/יש חסד.png";
import megaInCityImage from "./supermarketsImages/מגה בעיר.png";
import marketWarehouseForYouImage from "./supermarketsImages/מחסני השוק בשבילך.png";
import marketWarehouseMehadrinImage from "./supermarketsImages/מחסני השוק מהדרין.png";
import miniSuperAlonitImage from "./supermarketsImages/מיני סופר אלונית.png";
import spring2000Image from "./supermarketsImages/מעיין 2000.png";
import superPharmImage from "./supermarketsImages/סופר פארם.png";
import kingStoreImage from "./supermarketsImages/קינג סטור.png";
import ramiLeviImage from "./supermarketsImages/רמי לוי.png";
import shufersalExpressImage from "./supermarketsImages/שופרסל אקספרס.png";
import shufersalDealImage from "./supermarketsImages/שופרסל דיל.png";
import myShufersalImage from "./supermarketsImages/שופרסל שלי.png";
import cityMarketImage from "./supermarketsImages/שוק העיר.png";
import mehadrinMarketImage from "./supermarketsImages/שוק מהדרין.png";
import shiraMarketImage from "./supermarketsImages/שירה מרקט.png";
import shaareRevahaImage from "./supermarketsImages/שערי רווחה.png";
import plentyBlessingOfTheNameNearHomeImage from "./supermarketsImages/שפע ברכת השם קרוב לבית.png";
import marketGoodImage from "./supermarketsImages/good מרקט.png";

// "BE",
// "Carrefour city (קרפור סיטי)",
// "yellow",
// "אושר עד",
// "ברכל",
// "ויקטורי",
// "זול ובגדול",
// "יוחננוף",
// "יש בשכונה",
// "יש חסד",
// "מגה בעיר",
// "מחסני השוק בשבילך",
// "מחסני השוק מהדרין",
// "מיני סופר אלונית",
// "מעיין 2000",
// "סופר פארם",
// "קינג סטור",
// "רמי לוי",
// "שופרסל אקספרס",
// "שופרסל דיל",
// "שופרסל שלי",
// "שוק העיר",
// "שוק מהדרין",
// "שירה מרקט",
// "שערי רווחה",
// "שפע ברכת השם קרוב לבית"
// "good מרקט",

const getSupermarketImage = (supermarketName) => {
  switch (supermarketName) {
    case "BE":
      return beImage;
    case "Carrefour city (קרפור סיטי)":
      return carrefoutImage;
    case "yellow":
      return yellowImage;
    case "אושר עד":
      return osherAdImage;
    case "ברכל":
      return barcolImage;
    case "ויקטורי":
      return victoryImage;
    case "זול ובגדול":
      return bigAndCheapImage;
    case "יוחננוף":
      return yohananofImage;
    case "יש בשכונה":
      return thereInNeighborhoodImage;
    case "יש חסד":
      return chesedExistsImage;
    case "מגה בעיר":
      return megaInCityImage;
    case "מחסני השוק בשבילך":
      return marketWarehouseForYouImage;
    case "מחסני השוק מהדרין":
      return marketWarehouseMehadrinImage;
    case "מיני סופר אלונית":
      return miniSuperAlonitImage;
    case "מעיין 2000":
      return spring2000Image;
    case "סופר פארם":
      return superPharmImage;
    case "קינג סטור":
      return kingStoreImage;
    case "רמי לוי":
      return ramiLeviImage;
    case "שופרסל אקספרס":
      return shufersalExpressImage;
    case "שופרסל דיל":
      return shufersalDealImage;
    case "שופרסל שלי":
      return myShufersalImage;
    case "שוק העיר":
      return cityMarketImage;
    case "שוק מהדרין":
      return mehadrinMarketImage;
    case "שירה מרקט":
      return shiraMarketImage;
    case "שערי רווחה":
      return shaareRevahaImage;
    case "שפע ברכת השם קרוב לבית":
      return plentyBlessingOfTheNameNearHomeImage;
    case "good מרקט":
      return marketGoodImage;
    default:
      return marketGoodImage;
  }
};

const SupermarketImage = ({ supermarketName }) => {
  return (
    <img src={getSupermarketImage(supermarketName)} alt={supermarketName} />
  );
};

export default SupermarketImage;
