import { Text, TextStyle } from 'react-native';
import COLOR from '../constants/Colors';

interface Props {
    text: string;
    target: string;
    style: TextStyle;
}
export default function HighlightedText({ text, target, style }: Props) {
    if (target === '') return <Text style={style}>{text}</Text>;

    const parts = text.split(new RegExp(`(${target})`, 'gi'));

    return (
        <Text style={style}>
            {parts.map((part, index) =>
                part.toLowerCase() === target.toLowerCase() ? (
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
