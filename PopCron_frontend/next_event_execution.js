function getNextEventExecutionTime(time, date) {
    const [hour, minute] = time.split(":");
    let eventHour = parseInt(hour);

    if (eventHour >= 1 && eventHour <= 11) {
        eventHour += 12;
    }

    const [year, month, day] = date.split("-");
    const eventDate = new Date(`${year}-${month}-${day}T${eventHour.toString().padStart(2, "0")}:${minute}:00.000Z`);
    const eventDateTimeISO = eventDate.toISOString();

    return eventDateTimeISO;
}

module.exports = { getNextEventExecutionTime };
