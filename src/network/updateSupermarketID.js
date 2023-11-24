import axios from "axios";

const updateSupermarketID = async (userId, supermarketID) => {
  const response = await axios.patch(
    `http://localhost:8000/api/v1/supermarket/update-supermarket/${userId}/${supermarketID}`
  );
  return response.data;
};


export default updateSupermarketID;

