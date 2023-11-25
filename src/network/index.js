import { Axios } from "axios";
import { DOMAIN } from "../constants";

const httpClient = new Axios({
  baseURL: DOMAIN + "/api/v1/",
});

export default httpClient;
