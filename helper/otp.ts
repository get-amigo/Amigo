import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import apiHelper from './apiHelper';

export const sendOtpDev = async (phoneNumber: string) => {
  return phoneNumber;
};

export const sendOtp = async (phoneNumber: string) => {
  // @ts-ignore
  const { default: auth } = await import('@react-native-firebase/auth');
  const confirmation = await auth().signInWithPhoneNumber(phoneNumber);

  return confirmation;
}

export const verifyOtp = async ({ otp, confirm }: { otp: string, confirm: FirebaseAuthTypes.ConfirmationResult }) => {
  try {
    const result = await confirm?.confirm(otp);

    // @ts-ignore
    const { default: auth } = await import('@react-native-firebase/auth');
    const firebaseUser = result?.user || auth().currentUser;

    if (firebaseUser) {
      const firebaseIdToken = await firebaseUser.getIdToken();

      const { data: { user, token } } = await apiHelper.post(`/auth/verifyOTP`, { payload: firebaseIdToken });

      return { user, token };
    }

    return null;
  } catch (error) {
    console.log('Invalid code.');

    return null;
  }
}

export const verifyOtpDev = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    const { data: { user, token } } = await apiHelper.post(`/auth/verifyOTP`, { payload: phoneNumber });

    return { user, token };
  } catch (error) {
    console.log('Invalid code.');

    return null;
  }
};
