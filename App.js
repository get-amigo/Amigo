import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Button, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigator/RootNavigator';
import { KeyboardAvoidingView } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import * as Sentry from '@sentry/react-native';
import COLOR from './constants/Colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
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
            await Promise.all([]);
        } catch (e) {
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
    const onReloadPress = useCallback(() => {
        if (Platform.OS === 'web') {
            location.reload();
        } else {
            Updates.reloadAsync();
        }
    }, []);

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
