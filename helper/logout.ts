import { ENV } from '@env';

const logoutDev = async () => {};

const logoutProd = async () => {
    // @ts-ignore
    const { default: auth } = await import('@react-native-firebase/auth');
    await auth().signOut();
};

const logoutFunc: Record<string, any> = {
    development: logoutDev,
    staging: logoutProd,
    production: logoutProd,
};

export default logoutFunc[ENV] || logoutDev;
