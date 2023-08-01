function getNextEventExecutionTime(time, date) {
    const timePattern = /^(\d{1,2}):(\d{2})\s(AM|PM)$/i;
    const match = time.match(timePattern);

    const hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const meridian = match[3].toUpperCase();

    let eventHour = hour;

    if (meridian === "PM" && eventHour !== 12) {
        eventHour += 12;
    } else if (meridian === "AM" && eventHour === 12) {
        eventHour = 0;
    }

    const [year, month, day] = date.split("-");
    const eventDate = new Date(`${year}-${month}-${day}T${eventHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00.000Z`);
    const eventDateTimeISO = eventDate.toISOString();

    return eventDateTimeISO;
}

module.exports = { getNextEventExecutionTime };
