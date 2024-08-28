import { Text, TextStyle } from 'react-native';
import COLOR from '../constants/Colors';

interface Props {
    text: string;
    target: string;
    style: TextStyle;
}
export default function HighlightedText(props: Props) {
    if (props.target === '') return <Text style={props.style}>{props.text}</Text>;
    const parts = props.text.split(new RegExp(`(${props.target})`, 'gi'));
    return (
        <Text style={props.style}>
            {parts.map((part, index) =>
                part.toLowerCase() === props.target.toLowerCase() ? (
                    <Text key={index} style={{ color: COLOR.BUTTON }}>
                        {part}
                    </Text>
                ) : (
                    part
                ),
            )}
        </Text>
    );
}
