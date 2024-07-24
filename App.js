import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import COLOR from './constants/Colors';
import RootNavigator from './navigator/RootNavigator';

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
        <>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: COLOR.APP_BACKGROUND,
                }}
            >
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
            </SafeAreaView>
        </>
    );
}
export default Sentry.wrap(App);
