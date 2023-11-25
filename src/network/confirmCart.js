import axios from "axios";
import { DOMAIN } from "../constants";

const confirmCart = async (userId) => {
  const response = await axios.post(`${DOMAIN}/api/v1/carts/confirm/${userId}`);
  return response.data;
};

export default confirmCart;
