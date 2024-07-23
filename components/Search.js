import { FontAwesome } from '@expo/vector-icons';
import { useRef } from 'react';
import { StyleSheet, View, Pressable, TextInput } from 'react-native';

import COLOR from '../constants/Colors';
import { calcHeight, calcWidth } from '../helper/res';
function Search({ search, setSearch, loading }) {
    if (loading)
        return (
            <View style={[styles.inputContainer, { borderColor: COLOR.SKELETON_MASK_COLOR }]}>
                <TextInput
                    style={[styles.input, { opacity: 0 }]}
                    onChangeText={setSearch}
                    value={search}
                    placeholder="Search"
                    placeholderTextColor="gray"
                    ref={searchRef}
                />
            </View>
        );
    const searchRef = useRef();
    return (
        <Pressable style={styles.inputContainer} onPress={() => searchRef.current.focus()}>
            <FontAwesome name="search" size={calcWidth(4)} color="gray" />
            <TextInput
                style={styles.input}
                onChangeText={setSearch}
                value={search}
                placeholder="Search"
                placeholderTextColor="gray"
                ref={searchRef}
            />
        </Pressable>
    );
}

export default Search;

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcWidth(3),
        borderWidth: 1,
        borderColor: COLOR.BUTTON,
        borderRadius: 10,
        width: calcWidth(90),
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
    },
});
