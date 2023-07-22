function getNextEventExecutionTime(time, date) {
    const timePattern = /(\d+)[.:](\d+)/; // Regular expression to match time in the format hh:mm or hh.mm
    const match = time.match(timePattern);

    if (!match) {
        throw new Error("Invalid time format. Please use hh:mm or hh.mm");
    }
    const [hour, minute] = [parseInt(match[1]), parseInt(match[2])];

    let eventHour = hour;
    if (eventHour >= 1 && eventHour <= 11) {
        eventHour += 12;
    }

    const [year, month, day] = date.split("-");
    const eventDate = new Date(`${year}-${month}-${day}T${eventHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00.000Z`);
    const eventDateTimeISO = eventDate.toISOString();

    return eventDateTimeISO;
}

module.exports = { getNextEventExecutionTime };
