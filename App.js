import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigator/RootNavigator';
import { KeyboardAvoidingView, Platform } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { calcHeight } from './helper/res';
import COLOR from './constants/Colors';



function App() {
    return (
        <SafeAreaProvider>
            <StatusBar Style="auto" backgroundColor={COLOR.APP_BACKGROUND}/>
            <KeyboardAvoidingView 
                style={{ flex: 1,paddingTop: Platform.OS === 'android' ? calcHeight(2.6) : 0}} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                enabled
            keyboardVerticalOffset={-900}>
                <RootNavigator />
            </KeyboardAvoidingView>
            <FlashMessage position="top" duration={2000} />
        </SafeAreaProvider>
    );
}

export default App;
