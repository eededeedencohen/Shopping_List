import axios from "axios";
import { DOMAIN } from "../constants";

const getCheapestSupermarket = async (userId) => {
  const response = await axios.get(
    `${DOMAIN}/api/v1/carts/cheapest/${userId}`
  );
  return response.data;
};

export default getCheapestSupermarket;
