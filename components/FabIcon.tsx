import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

import COLOR from '../constants/Colors';
import plusIconStyle from '../constants/plusIconStyle';
import { calcHeight, calcWidth } from '../helper/res';

interface FabIconProps {
    onPress: () => void;
    loading: boolean;
}

const FabIcon: React.FC<FabIconProps> = ({ onPress, loading }) => {
    if (loading) {
        return (
            <View style={styles.fabContainer}>
                <FAB style={[styles.fab, { backgroundColor: COLOR.SKELETON_MASK_COLOR }]} customSize={calcHeight(9)} color="white" />
            </View>
        );
    }
    return (
        <View style={styles.fabContainer}>
            <FAB style={styles.fab} icon="plus" customSize={calcHeight(9)} onPress={onPress} color="white" />
        </View>
    );
};

export default FabIcon;

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: calcHeight(5),
        right: calcWidth(6.5),
    },
    fab: plusIconStyle,
});
