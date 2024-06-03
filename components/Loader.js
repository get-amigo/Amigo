import React from 'react';
import { SafeAreaView, Image, StyleSheet, View, Text } from 'react-native';
import AmigoIcon from '../assets/icon.png';
import { MotiView } from 'moti';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth } from '../helper/res';

function Loader() {
    return (
        <MotiView style={styles.container}>
            <View style={styles.shadow}>
                <MotiView
                    from={{ scale: 1.5 }}
                    animate={{ scale: 0.5 }}
                    transition={{ loop: true, type: 'timing', duration: 500, repeatReverse: true }}
                    style={styles.image}
                >
                    {/* <Text style={{ color: "#FFF", fontSize: 60 }}>AA</Text> */}
                    <Image source={AmigoIcon} style={styles.image} />
                </MotiView>
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: "black",
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    shadow: {
        width: '40%',
        height: '20%',
        elevation: 20,
        shadowColor: COLOR.BORDER_COLOR,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        borderRadius: 100,
        borderWidth: 10,
        borderColor: COLOR.BUTTON,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: calcWidth(24),
        height: calcHeight(24),
        borderRadius: 100,
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Loader;
