function formatTo12HourTime(dateString) {
    const date = new Date(dateString);
    const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    return formattedTime;
}

export default formatTo12HourTime;
