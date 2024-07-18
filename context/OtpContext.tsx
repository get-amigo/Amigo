import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import PAGES from '../constants/pages';
import { useAuth } from '../stores/auth';
import { sendOtp, verifyOtp, sendOtpDev, verifyOtpDev, onAuthStateChanged } from '../helper/otp';
import apiHelper from '../helper/apiHelper';
import { ENV } from '@env';

type OtpContextType = {
  loginWithPhoneNumber: (phoneNumber: string) => void;
  verifyOtp: (otp: string) => void;
  loading: boolean;
};

const OtpContext = createContext<OtpContextType>({
  loginWithPhoneNumber: () => {},
  verifyOtp: () => {},
  loading: false,
});

const OtpProviderProd = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    (async () => {
      try {
        unsubscribe = await onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            const firebaseIdToken = await firebaseUser.getIdToken();
            
            setLoading(true);
            const { data: { user, token } } = await apiHelper.post(`/auth/verifyOTP`, { payload: firebaseIdToken });

            login({ user, token });
            navigation.navigate(PAGES.BALANCE);
            setLoading(false);
          }
        });
      } catch (error) {
        Sentry.captureException(error);
        setLoading(false);
      }
    })();

    return () => unsubscribe();
  }, []);

  const loginWithPhoneNumber = async (phoneNumber: string) => {
    const res = await sendOtp(phoneNumber);
    setConfirm(res);
  };

  const verifyPhoneNumber = async (otp: string) => {
    if (!confirm) return;

    const res = await verifyOtp({ otp, confirm });

    if (res) {
      login(res);
      navigation.navigate(PAGES.BALANCE);
    }
  };

  return (
    <OtpContext.Provider value={{ loginWithPhoneNumber, verifyOtp: verifyPhoneNumber, loading }}>
      {children}
    </OtpContext.Provider>
  );
};

const OtpProviderDev = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const loginWithPhoneNumber = async (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    await sendOtpDev(phoneNumber);
  };

  const verifyPhoneNumber = async () => {
    const res = await verifyOtpDev({ phoneNumber });

    if (res) {
      login(res);
      navigation.navigate(PAGES.BALANCE);
    }
  };

  return (
    <OtpContext.Provider value={{ loginWithPhoneNumber, verifyOtp: verifyPhoneNumber, loading: false }}>
      {children}
    </OtpContext.Provider>
  );
};

const otpProviders: Record<string, React.FC<{ children: ReactNode }>> = {
  dev: OtpProviderDev,
  development: OtpProviderDev,
  staging: OtpProviderProd,
  production: OtpProviderProd,
};

export const OtpProvider = otpProviders[ENV] || OtpProviderDev;

export const useOtp = () => useContext(OtpContext);
