import axios, { AxiosInstance } from 'axios';
import { ZipCodeResult } from '../../../shared/types/zipCode';
import { Config } from '../config';
import CustomError from '../errors/CustomError';

export class ZipCodeClient {
    zipCodeApi: AxiosInstance;
    defaultCountryCode: string;

    constructor(config: Config) {
        this.defaultCountryCode = config.ZIP_CODE_DEFAULT_COUNTRY_CODE;
        this.zipCodeApi = axios.create({
            baseURL: config.ZIP_CODE_URL,
            headers: {
                apiKey: config.ZIP_CODE_API_KEY,
                'Content-type': 'application/json'
            }
        });
    }

    getSearchCodes = (codes: string, countryCode: string = ''): Promise<ZipCodeResult> => {
        if (!countryCode) {
            countryCode = this.defaultCountryCode
        }

        return this.zipCodeApi.get(`search?codes=${codes}&country=${countryCode}`)
            .then(({ data }) => {
                const result: ZipCodeResult = data.results[codes] && data.results[codes][0] || null;
                return result;
            })
            .catch(err => {
                throw new CustomError(err);
            });
    }
}