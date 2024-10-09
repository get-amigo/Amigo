import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-native-safe-area-context';

import ContactList from '../components/ContactList';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';

const CreateGroup = ({ navigation }) => {
    const { selectedContacts } = useContacts();

    const previewNewGroup = () => {
        if (selectedContacts.length === 0) {
            Toast.show('Please select a contact', {
                duration: Toast.durations.LONG,
            });
        } else {
            navigation.navigate(PAGES.FINALISE_NEW_GROUP);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={40}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../assets/icons/return.png')} style={{ width: 24, height: 24 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={previewNewGroup}>
                            <Text style={styles.titleText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.titleText}>Add members</Text>
                    </View>
                    <View style={styles.contactListContainer}>
                        <ContactList addMemberWithoutContact={false} />
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: calcWidth(7),
        flex: 1,
        marginBottom: calcWidth(3),
        marginTop: calcWidth(4),
    },
    header: {
        marginBottom: calcWidth(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        color: COLOR.PRIMARY,
        fontSize: getFontSizeByWindowWidth(17),
        fontWeight: 'bold',
        marginVertical: calcHeight(2),
    },
    contactListContainer: {
        marginTop: calcWidth(3),
        alignItems: 'center',
        flex: 1,
    },
});

export default CreateGroup;
