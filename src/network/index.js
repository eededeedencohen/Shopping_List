import { Axios } from "axios";

const httpClient = new Axios({
  baseURL: process.env.REACT_APP_SERVER_BASE_URL,
});

export default httpClient;
