import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import Loader from '../components/Loader';
import { useAuth } from '../stores/auth';
import linking from '../helper/linking';
import { TransactionProvider } from '../context/TransactionContext';
import { GroupProvider } from '../context/GroupContext';

const queryClient = new QueryClient();

function RootNavigator() {
    const { user } = useAuth();

    return (
        <QueryClientProvider client={queryClient}>
            <GroupProvider>
                <TransactionProvider>
                    <NavigationContainer linking={linking}>{user ? <AppNavigator /> : AuthNavigator}</NavigationContainer>
                </TransactionProvider>
            </GroupProvider>
        </QueryClientProvider>
    );
}

export default RootNavigator;
