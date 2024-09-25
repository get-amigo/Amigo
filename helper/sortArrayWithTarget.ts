export default function sortArrayWithTarget({ arr, target }: { arr: string[]; target: string }) {
    if (target === '') return arr;
    return arr.sort((a, b) => {
        const indexA = a.toLowerCase().search(target.toLowerCase());
        const indexB = b.toLowerCase().search(target.toLowerCase());
        return indexA - indexB;
    });
}
