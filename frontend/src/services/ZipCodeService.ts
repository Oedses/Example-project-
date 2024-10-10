import { AxiosResponse } from "axios";
import api from "../api";
import { SearchCodeResponse } from "../../../shared/types/zipCode";
import { zipCode }  from "./paths";

export default class ZipCodeService {
  public static getSearchCodes = (codes: string, countryCode: string = ''): Promise<AxiosResponse<SearchCodeResponse>> =>
    api.get(`${zipCode.searchCodes}?codes=${codes}&countryCode=${countryCode}`);
}

