import apiHelper from './apiHelper';
import { ENV } from '@env';

const sendOtpDev = async (phoneNumber: string) => {
    return phoneNumber;
};

const sendOtpProd = async (phoneNumber: string) => {
    const { default: auth } = await import('@react-native-firebase/auth');
    const { _verificationId } = await auth().signInWithPhoneNumber(phoneNumber);
    return _verificationId;
};

const sendOtpFunctions: { [key: string]: (phoneNumber: string) => Promise<string> } = new Proxy(
    {
        dev: sendOtpDev,
        development: sendOtpDev,
        production: sendOtpProd,
    },
    {
        get: function (target, name: string) {
            return target[name as keyof typeof target] || sendOtpDev;
        },
    },
);

export const sendOtp = sendOtpFunctions[ENV || 'development'] || sendOtpDev;

export const verifyOtp = async ({ payload, otp }: { payload: string; otp: string }) => {
    try {
        const { data } = await apiHelper.post(`/auth/verifyOTP`, { payload, otp });
        const { user, token } = data;
        return { user, token };
    } catch (error) {
        return {};
    }
};
