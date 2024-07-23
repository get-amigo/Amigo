import { Image, View } from 'react-native';

import GPayLogo from '../assets/icons/upi/gPay.png';
import PaytmLogo from '../assets/icons/upi/paytm.png';
import PhonePeLogo from '../assets/icons/upi/phonePe.png';
import UPILogo from '../assets/icons/upi/upi.png';
import { calcHeight } from '../helper/res';

const createIcon = (source) => (
    <View
        style={{
            margin: calcHeight(3),
        }}
    >
        <Image
            source={source}
            style={{
                height: calcHeight(5),
                aspectRatio: 1,
                resizeMode: 'contain',
            }}
        />
    </View>
);

const generateDeeplink = (baseURL, params) => {
    const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    return `${baseURL}${queryParams}`;
};

export default [
    {
        name: 'Google Pay',
        generateDeeplink: (params) => generateDeeplink('tez://upi/pay?', params),
        icon: createIcon(GPayLogo),
    },
    {
        name: 'PhonePe',
        generateDeeplink: (params) => generateDeeplink('phonepe://pay?', params),
        icon: createIcon(PhonePeLogo),
    },
    {
        name: 'Paytm',
        generateDeeplink: (params) => generateDeeplink('paytmmp://pay?', params),
        icon: createIcon(PaytmLogo),
    },
    // {
    //     name: 'Amazon Pay',
    //     generateDeeplink: (params) => generateDeeplink('amazonpay://pay?', params),
    //     icon: createIcon(AmazonPayLogo),
    // },
    // {
    //     name: 'BHIM UPI',
    //     generateDeeplink: (params) => generateDeeplink('bhim://upi/pay?', params),
    //     icon: createIcon(BhimLogo),
    // },
    {
        name: 'Default UPI App',
        generateDeeplink: (params) => generateDeeplink('upi://pay?', params),
        icon: createIcon(UPILogo), // Replace with actual logo URI
    },
];
