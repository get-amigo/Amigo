export default function SortArrayWithTarget<T extends string>({ arr, target }: { arr: Array<T>; target: string }) {
    if (target === '') return arr;
    return arr.sort((a, b) => {
        const indexA = a.toLowerCase().search(target.toLowerCase());
        const indexB = b.toLowerCase().search(target.toLowerCase());
        return indexA - indexB;
    });
}
