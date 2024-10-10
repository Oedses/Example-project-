export type GetSearchCodesRequest = {
    codes: string
    countryCode: string
}

export type ZipCodeResult = {
    postal_code: string
    country_code: string
    latitude: string
    longitude: string
    city: string
    state: string
    city_en: string
    state_en: string
    state_code: string
    province: string
    province_code: string
}

export type SearchCodeResponse = {
    city: string
    address: string
}