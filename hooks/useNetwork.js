import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

const useNetwork = () => {
    const [isConnected, setConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return isConnected;
};

export default useNetwork;
