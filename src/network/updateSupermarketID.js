import axios from "axios";
import { DOMAIN } from "../constants";

const updateSupermarketID = async (userId, supermarketID) => {
  const response = await axios.patch(
    `${DOMAIN}/api/v1/supermarket/update-supermarket/${userId}/${supermarketID}`
  );
  return response.data;
};

export default updateSupermarketID;
