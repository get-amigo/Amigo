import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import COLOR from '../constants/Colors';
import { GroupProvider } from '../context/GroupContext';
import { TransactionProvider } from '../context/TransactionContext';
import linking from '../helper/linking';
import { useAuth } from '../stores/auth';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const queryClient = new QueryClient();

function RootNavigator() {
    const { user } = useAuth();

    return (
        <QueryClientProvider client={queryClient}>
            <GroupProvider>
                <TransactionProvider>
                    <NavigationContainer
                        linking={linking}
                        theme={{
                            colors: {
                                background: COLOR.APP_BACKGROUND,
                            },
                        }}
                    >
                        {user ? <AppNavigator /> : AuthNavigator}
                    </NavigationContainer>
                </TransactionProvider>
            </GroupProvider>
        </QueryClientProvider>
    );
}

export default RootNavigator;
