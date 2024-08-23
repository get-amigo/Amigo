import { Text, TextStyle } from 'react-native';
import SortArrayWithTarget from '../helper/sortArrayWithTarget';

interface Props {
    text: string;
    target: string;
    style: TextStyle;
}
export default function HightlightedText(props: Props) {
    if (props.target === '') return <Text style={props.style}>{props.text}</Text>;
    const parts = props.text.split(new RegExp(`(${props.target})`, 'gi'));
    return (
        <Text style={props.style}>
            {parts.map((part, index) =>
                part.toLowerCase() === props.target.toLowerCase() ? (
                    <Text key={index} style={{ fontWeight: '900' }}>
                        {part}
                    </Text>
                ) : (
                    part
                ),
            )}
        </Text>
    );
}
