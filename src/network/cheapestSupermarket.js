import axios from "axios";

const getCheapestSupermarket = async (userId) => {
  const response = await axios.get(
    `http://localhost:8000/api/v1/carts/cheapest/${userId}`
  );
  return response.data;
};

export default getCheapestSupermarket;
