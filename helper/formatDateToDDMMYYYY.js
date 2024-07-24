function formatDateToDDMMYYYY(dateString) {
    // Parse the input string to a Date object
    const date = new Date(dateString);

    // Ensure the date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    // Extract day, month, and year and format them
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    // Return the formatted date string
    return day + '-' + month + '-' + year;
}

export default formatDateToDDMMYYYY;
