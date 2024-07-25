import { Foundation, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'; // Example color, replace with actual color needed.
import React from 'react';
import { Image } from 'react-native';

import Expense from '../../assets/icons/expense.png';
import SelectedExpense from '../../assets/icons/selectedExpense.png';
import COLOR from '../../constants/Colors';
import PAGES from '../../constants/pages';
import { calcWidth } from '../../helper/res';
const color = COLOR.BUTTON;
const size = calcWidth(6.5);
export default ({ focused, screen }) => {
    const icons = {
        [PAGES.BALANCE]: focused ? (
            <Foundation name="home" size={size} color={color} />
        ) : (
            <Octicons name="home" size={size} color={color} />
        ),
        [PAGES.GROUP_LIST]: focused ? (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
        ) : (
            <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
        ),

        [PAGES.EXPENSE]: focused ? (
            <Image
                style={{
                    width: size,
                    height: size,
                }}
                source={SelectedExpense}
            />
        ) : (
            <Image
                style={{
                    width: size,
                    height: size,
                }}
                source={Expense}
            />
        ),
    };

    return icons[screen] || null;
};
