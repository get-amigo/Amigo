import * as Linking from 'expo-linking';

import PAGES from '../constants/pages';
const prefix = Linking.createURL('/');
const linking = {
    prefixes: [prefix, 'amigo://'],
    async getInitialURL() {
        const url = await Linking.getInitialURL();
        if (url != null) {
            return url;
        }
        return null;
    },
    subscribe(listener) {
        const onReceiveURL = ({ url }) => listener(url);

        const subscription = Linking.addEventListener('url', onReceiveURL);

        return () => {
            subscription.remove();
        };
    },
    config: {
        screens: {
            [PAGES.INVITATION_LANDING_PAGE]: {
                path: 'join',
                parse: {
                    groupId: (groupId) => `${groupId}`,
                },
            },
        },
    },
};
export default linking;
