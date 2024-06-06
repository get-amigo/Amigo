import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigator/RootNavigator';
import { KeyboardAvoidingView, Platform } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import * as Sentry from '@sentry/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

Sentry.init({
    dsn: 'https://5e35d45895f220b8681a2ce7bb0728df@o4507295198085120.ingest.us.sentry.io/4507295216762880',
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    debug: true,
});

function App() {
    return (
        <GestureHandlerRootView>
            <SafeAreaProvider>
                <StatusBar style="auto" />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    enabled
                    keyboardVerticalOffset={-900}
                >
                    <RootNavigator />
                </KeyboardAvoidingView>
                <FlashMessage position="top" duration={2000} />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export default Sentry.wrap(App);
