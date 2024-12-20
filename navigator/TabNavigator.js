import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBarIcon from '../components/TabBarIcon';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import safeAreaStyle from '../constants/safeAreaStyle';
import tabBarStyle from '../constants/tabBarStyle';
import { calcWidth } from '../helper/res';
import BalanceScreen from '../pages/BalanceScreen';
import ExpenseScreen from '../pages/ExpenseScreen';
import GroupListScreen from '../pages/GroupListScreen';

const Tab = createMaterialTopTabNavigator();

const TabNavigator = () => {
    return (
        <SafeAreaView style={safeAreaStyle}>
            <Tab.Navigator
                screenOptions={{
                    tabBarLabel: () => null, // Add this line to disable labels
                    tabBarStyle,
                    tabBarIndicatorStyle: {
                        backgroundColor: 'transparent', // Set transparent to hide the default indicator
                    },
                    tabBarIconStyle: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: calcWidth(13),
                        width: calcWidth(13),
                    },
                }}
                tabBarPosition="bottom"
            >
                <Tab.Group>
                    <Tab.Screen
                        name={PAGES.BALANCE}
                        options={{
                            headerShown: false,
                            tabBarIcon: (tabBarProps) => <TabBarIcon tabBarProps={tabBarProps} screen={PAGES.BALANCE} />,
                        }}
                        component={BalanceScreen}
                    />

                    <Tab.Screen
                        name={PAGES.GROUP_LIST}
                        component={GroupListScreen}
                        options={{
                            headerStyle: {
                                backgroundColor: COLOR.APP_BACKGROUND,
                            },
                            title: null,
                            tabBarIcon: (tabBarProps) => <TabBarIcon tabBarProps={tabBarProps} screen={PAGES.GROUP_LIST} />,
                        }}
                    />

                    <Tab.Screen
                        name={PAGES.EXPENSE}
                        component={ExpenseScreen}
                        options={{
                            tabBarIcon: (tabBarProps) => <TabBarIcon tabBarProps={tabBarProps} screen={PAGES.EXPENSE} />,
                        }}
                    />
                </Tab.Group>
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default TabNavigator;
