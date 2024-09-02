export default function sortArrayWithTargetAndTargetProp<
    T extends Record<string, any>,
    K extends keyof T, // ensures that K is a valid key of the objects in the array
>({
    arr,
    target,
    targetProp,
}: {
    arr: T[];
    target: string;
    targetProp: K; // targetProp is a key of T
}) {
    if (target == '') return arr;

    return arr.sort((a, b) => {
        const indexA = a[targetProp]!.toLowerCase().search(target.toLowerCase());
        const indexB = b[targetProp]!.toLowerCase().search(target.toLowerCase());
        return indexA - indexB;
    });
}
