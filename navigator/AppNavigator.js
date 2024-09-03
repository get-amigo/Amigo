import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import TabBarIcon from '../components/TabBarIcon';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { getFontSizeByWindowWidth } from '../helper/res';
import { ContactsProvider } from '../hooks/useContacts';
import useNotificationResponse from '../hooks/useNotificationResponse';
import About from '../pages/About';
import AccountScreen from '../pages/AccountScreen';
import ActivitiesFeedScreen from '../pages/ActivitiesFeedScreen';
import AddPeople from '../pages/AddPeople';
import CreateGroup from '../pages/CreateGroup';
import FAQ from '../pages/FAQ';
import GroupBalance from '../pages/GroupBalanceScreen';
import GroupQrScreen from '../pages/GroupQrScreen';
import GroupSettings from '../pages/GroupSettings';
import GroupSplitScreen from '../pages/GroupSplitScreen';
import InvitationLandingScreen from '../pages/InvitationLandingScreen';
import LoginScreen from '../pages/LoginScreen';
import PaymentScreen from '../pages/PaymentScreen';
import QRCodeScanner from '../pages/QRCodeScanner';
import SearchScreen from '../pages/Search';
import SelectGroup from '../pages/SelectGroup';
import SelectPaidBy from '../pages/SelectPaidBy';
import SignUpScreen from '../pages/SignUpScreen';
import TransactionDetail from '../pages/TransactionDetails';
import TransactionFormScreen from '../pages/TransactionForm';
import UPIAppSelection from '../pages/UPIAppSelection';
import { useAuth } from '../stores/auth';
import TabNavigator from './TabNavigator';
const Stack = createNativeStackNavigator();
const AppNavigator = () => {
    const { user } = useAuth();

    useNotificationResponse();
    return (
        <ContactsProvider>
            <Stack.Navigator
                screenOptions={{
                    headerBackTitleVisible: false,
                }}
            >
                {user.name ? (
                    <Stack.Group>
                        <Stack.Screen
                            name={PAGES.TAB_NAVIGATOR}
                            options={{
                                headerShown: false,
                                tabBarIcon: (tabBarProps) => <TabBarIcon tabBarProps={tabBarProps} screen={PAGES.BALANCE} />,
                                animation: 'fade',
                            }}
                            component={TabNavigator}
                        />
                        <Stack.Screen
                            name={PAGES.SELECT_PAID_BY}
                            component={SelectPaidBy}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'ios',
                                title: null,
                                headerTintColor: '#fff',
                                headerTitle: 'Paid By',
                                headerTitleStyle: {
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: getFontSizeByWindowWidth(19),
                                },
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.GROUP_SETTINGS}
                            component={GroupSettings}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'ios',
                                headerTintColor: '#fff',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.SCANNER}
                            component={QRCodeScanner}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'fade',
                                headerTintColor: '#fff',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.GROUP_BALANCE}
                            component={GroupBalance}
                            options={{
                                animation: 'ios',
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.SEARCH}
                            component={SearchScreen}
                            options={{
                                // headerShown: false,
                                animation: 'fade',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.ACCOUNT}
                            component={AccountScreen}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'fade',
                                headerTintColor: '#fff',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.FAQ}
                            component={FAQ}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'ios',
                                headerTintColor: '#fff',
                            }}
                        />

                        <Stack.Screen
                            name={PAGES.ABOUT}
                            component={About}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'ios',
                                headerTintColor: '#fff',
                            }}
                        />

                        <Stack.Screen
                            name={PAGES.UPI_APP_SELECTION}
                            component={UPIAppSelection}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                headerTintColor: '#fff',
                            }}
                        />

                        <Stack.Screen
                            name={PAGES.ADD_PEOPLE}
                            component={AddPeople}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                headerTintColor: '#fff',
                                headerBackTitleVisible: false,
                            }}
                        />

                        <Stack.Screen
                            name={PAGES.PAYMENT}
                            component={PaymentScreen}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'ios',
                                headerTitleAlign: 'left', // Aligns the title to the left
                                headerTintColor: '#fff', // Sets the title color to white
                            }}
                        />

                        <Stack.Screen
                            name={PAGES.GROUP}
                            component={ActivitiesFeedScreen}
                            options={{
                                headerShown: false,
                                animation: 'ios',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.GROUP_SPLIT_SCREEN}
                            component={GroupSplitScreen}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'ios',
                                title: null,
                                headerTintColor: '#fff',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.SELECT_GROUP}
                            component={SelectGroup}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                headerTitle: 'Add groups',
                                headerTitleStyle: {
                                    color: 'white', // Sets the title color to white
                                    fontWeight: 'bold', // Makes the title bold
                                    fontSize: getFontSizeByWindowWidth(20),
                                },
                                headerTintColor: '#fff',
                                animation: 'ios',
                            }}
                        />

                        <Stack.Screen
                            name={PAGES.ADD_TRANSACTION}
                            component={TransactionFormScreen}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'fade',
                                title: null,
                                headerTintColor: '#fff',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.CREATE_GROUP}
                            component={CreateGroup}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                title: 'New group',
                                headerTintColor: '#fff',
                                animation: 'ios',
                                headerTitleStyle: {
                                    color: 'white',
                                },
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.TRANSACTION_DETAIL}
                            component={TransactionDetail}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                headerTintColor: '#fff',
                                title: null,
                                animation: 'ios',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.INVITATION_LANDING_PAGE}
                            component={InvitationLandingScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.EDIT_PHONE_NUMBER}
                            component={LoginScreen}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'fade',
                                title: null,
                                headerTintColor: '#fff',
                            }}
                        />
                        <Stack.Screen
                            name={PAGES.GROUP_QR_SCREEN}
                            component={GroupQrScreen}
                            options={{
                                headerStyle: {
                                    backgroundColor: COLOR.APP_BACKGROUND,
                                },
                                animation: 'fade',
                                title: null,
                                headerTintColor: '#fff',
                                headerTitle: 'QR code',
                            }}
                        />
                    </Stack.Group>
                ) : (
                    <Stack.Screen
                        name={PAGES.SIGN_UP}
                        options={{
                            headerShown: false,
                            animation: 'fade',
                        }}
                        component={SignUpScreen}
                    />
                )}
            </Stack.Navigator>
        </ContactsProvider>
    );
};

export default AppNavigator;
