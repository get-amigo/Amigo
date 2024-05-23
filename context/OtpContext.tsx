import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import PAGES from '../constants/pages';
import { useAuth } from '../stores/auth';
import { sendOtp, verifyOtp, sendOtpDev, verifyOtpDev, onAuthStateChanged } from '../helper/otp';
import { ENV } from '@env';

type OtpContextType = {
  loginWithPhoneNumber: (phoneNumber: string) => void;
  verifyOtp: (otp: string) => void;
};

const OtpContext = createContext<OtpContextType>({
  loginWithPhoneNumber: () => {},
  verifyOtp: () => {},
});

const OtpProviderProd = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    (async () => {
      unsubscribe = await onAuthStateChanged(({ user, token }) => {
        if (user && token) {
          login({ user, token });
          navigation.navigate(PAGES.BALANCE);
        }
      });
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
    <OtpContext.Provider value={{ loginWithPhoneNumber, verifyOtp: verifyPhoneNumber }}>
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
    <OtpContext.Provider value={{ loginWithPhoneNumber, verifyOtp: verifyPhoneNumber }}>
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

export const OtpProvider = otpProviders[ENV] || OtpProviderProd;

export const useOtp = () => useContext(OtpContext);
