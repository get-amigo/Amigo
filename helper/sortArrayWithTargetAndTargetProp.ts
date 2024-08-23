export default function SortArrayWithTargetAndTargetProp<T extends Record<string, string>>({
    arr,
    target,
    targetProp,
}: {
    arr: Array<T>;
    target: string;
    targetProp: string;
}) {
    if (target == '') return arr;

    return arr.sort((a, b) => {
        const indexA = a[targetProp]!.toLowerCase().search(target.toLowerCase());
        const indexB = b[targetProp]!.toLowerCase().search(target.toLowerCase());
        return indexA - indexB;
    });
}
