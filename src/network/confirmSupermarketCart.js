import axios from "axios";


const confirmSupermarketCart = async (userId) => {
  const responseUpdate = await axios.post(
    `http://localhost:8000/api/v1/supermarket/confirm/${userId}`
  );
  return responseUpdate.data;
};

export default confirmSupermarketCart;
