import { GetSearchCodesRequest, SearchCodeResponse } from '../../../shared/types/zipCode';
import { ZipCodeClient } from '../clients/ZipCodeClient';

export default class ZipCodeService {
    private zipCodeClient: ZipCodeClient;

    constructor(zipCodeClient: ZipCodeClient) {
        this.zipCodeClient = zipCodeClient;
    }

    async getSearchCodes({ codes, countryCode }: GetSearchCodesRequest): Promise<SearchCodeResponse>  {
        const resultCode = await this.zipCodeClient.getSearchCodes(codes, countryCode);

        const searchCodeResponse: SearchCodeResponse = {
            city: '',
            address: ''
        };

        if (resultCode) {
            searchCodeResponse.city = resultCode.city_en || '';
            searchCodeResponse.address = resultCode.state_en || '';

            if (resultCode.province) {
                searchCodeResponse.address = searchCodeResponse.address 
                    ? searchCodeResponse.address + ', ' + resultCode.province 
                    : resultCode.province;
            }
        }

        return searchCodeResponse;
    };
}
