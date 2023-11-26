import axios from "axios";
import { DOMAIN } from "../constants";

const getCheapestSupermarket = async (userId) => {
  const response1 = await axios.get(
    `${DOMAIN}/api/v1/carts/cheapest/${userId}`
  );
  console.log(response1.data);

  const response = await axios.get(
    `${DOMAIN}/api/v1/carts/active/${userId}`
  );
  return response.data;
};


export default getCheapestSupermarket;
