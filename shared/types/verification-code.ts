import { Modify } from "./common"

export enum VerificationCodeType {
    EMAIL = 'email',
    PASSWORD = 'password',
    PHONE = "phone"
}

export type VerificationCode = {
    _id?: any
    userId: string
    code: string
    type: VerificationCodeType
    value: string
}

export type GenerateVerificationCode = Modify<VerificationCode, {
    code?: string
}>

export type CheckVerificationCodeRequest = {
    code: string
    type: VerificationCodeType
}