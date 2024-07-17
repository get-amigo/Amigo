function getDateAndMonth(dateString) {
    // Parse the dateString into a Date object
    const date = new Date(dateString);

    // Array of month names
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    return day + ' ' + month;
}

export default getDateAndMonth;
