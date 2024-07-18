import areDatesEqual from './areDatesEqual';

function formatDateRelativeToToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (areDatesEqual(today, date)) {
        return 'Today';
    } else if (areDatesEqual(yesterday, date)) {
        return 'Yesterday';
    }
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
    return formattedDate;
}

export default formatDateRelativeToToday;
