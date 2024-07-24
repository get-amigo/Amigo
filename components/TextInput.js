import { useRef } from 'react';
import { TextInput as DefaultInput, Pressable, StyleSheet } from 'react-native';

import { calcWidth } from '../helper/res';

function TextInput(propsOverwrite) {
    const textRef = useRef();
    return (
        <Pressable style={styles.container} onPress={() => textRef.current.focus()}>
            <DefaultInput style={styles.input} placeholderTextColor="#ccc" ref={textRef} textAlign="center" {...propsOverwrite} />
        </Pressable>
    );
}

export default TextInput;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        color: 'white',
    },
    input: {
        padding: calcWidth(3),
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        width: calcWidth(30),
        color: 'white',
    },
});
