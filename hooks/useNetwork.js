import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const useNetwork = () => {
    const [isConnected, setConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setConnected(state.isConnected);
            // if (!state.isConnected) {
            //   showAlert();
            // }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return isConnected;
};

export default useNetwork;
