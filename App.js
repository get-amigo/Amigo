import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RootNavigator from './navigator/RootNavigator';
import { KeyboardAvoidingView, Platform, StatusBar as NativeStatusBar } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import * as Sentry from '@sentry/react-native';
import COLOR from './constants/Colors';

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
                style={[
                    {
                        flex: 1,
                        backgroundColor: COLOR.APP_BACKGROUND,
                    },
                    Platform.OS === 'ios' && { paddingTop: NativeStatusBar.currentHeight },
                ]}
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
