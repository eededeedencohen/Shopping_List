import axios from "axios";

const confirmCart = async (userId) => {
  const response = await axios.post(
    `http://localhost:8000/api/v1/carts/confirm/${userId}`
  );
  return response.data;
};

export default confirmCart;
