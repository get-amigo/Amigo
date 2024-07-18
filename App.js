import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigator/RootNavigator';

Sentry.init({
    dsn: 'https://5e35d45895f220b8681a2ce7bb0728df@o4507295198085120.ingest.us.sentry.io/4507295216762880',
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    debug: true,
});

SplashScreen.preventAutoHideAsync().catch(() => {});

function App() {
    return (
        <AnimatedAppLoader image={require('./assets/SplashScreen.gif')}>
            <MainScreen />
        </AnimatedAppLoader>
    );
}

function AnimatedAppLoader({ children, image }) {
    const [isSplashReady, setSplashReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            await Asset.fromModule(image).downloadAsync();
            setSplashReady(true);
        }

        prepare();
    }, [image]);

    if (!isSplashReady) {
        return null;
    }

    return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children, image }) {
    const animation = useMemo(() => new Animated.Value(1), []);
    const [isAppReady, setAppReady] = useState(false);
    const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        if (isAppReady) {
            Animated.timing(animation, {
                toValue: 0,
                duration: 3500,
                useNativeDriver: true,
            }).start(() => setAnimationComplete(true));
        }
    }, [isAppReady]);

    const onImageLoaded = useCallback(async () => {
        try {
            await SplashScreen.hideAsync();
        } catch (e) {
            console.warn(e);
        } finally {
            setAppReady(true);
        }
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {isAppReady && children}
            {!isSplashAnimationComplete && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: Constants.expoConfig.splash.backgroundColor,
                        },
                    ]}
                >
                    <Animated.Image
                        style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: Constants.expoConfig.splash.resizeMode || 'contain',
                        }}
                        source={image}
                        onLoadEnd={onImageLoaded}
                        fadeDuration={0}
                    />
                </Animated.View>
            )}
        </View>
    );
}

function MainScreen() {
    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
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
    );
}

export default Sentry.wrap(App);
