import axios from "axios";
import { DOMAIN } from "../constants";


const confirmSupermarketCart = async (userId) => {
  const responseUpdate = await axios.post(
    `${DOMAIN}/api/v1/supermarket/confirm/${userId}`
  );
  return responseUpdate.data;
};

export default confirmSupermarketCart;
