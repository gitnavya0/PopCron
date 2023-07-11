function parseCronExpression(expression) {
  const fields = expression.split(' ');

  if (fields.length !== 5) {
    return 'Invalid expression!';
  }

  const minute = parseField(fields[0], 0, 59);
  const hour = parseField(fields[1], 0, 23);
  const dayOfMonth = parseField(fields[2], 1, 31);
  const month = parseField(fields[3], 1, 12);
  const dayOfWeek = parseField(fields[4], 0, 6);

  return `Minute: ${minute}\nHour: ${hour}\nDay of Month: ${dayOfMonth}\nMonth: ${month}\nDay of Week: ${dayOfWeek}`;
}

function parseField(field, min, max) {
  const values = [];

  if (field === '*') {
    for (let i = min; i <= max; i++) {
      values.push(i);
    }
  }
  else {
    const parts = field.split(',');

    for (let part of parts) {
      if (part.includes('/')) {
        const [start, increment] = part.split('/');

        for (let i = parseInt(start); i <= max; i += parseInt(increment)) {
          values.push(i);
        }
      }
      else if (part.includes('-')) {
        const [start, end] = part.split('-');

        for (let i = parseInt(start); i <= parseInt(end); i++) {
          values.push(i);
        }
      }
      else {
        values.push(parseInt(part));
      }
    }
  }

  return values.join(' ');
}


const cronExpression = '30 9 15 * *';
const result = parseCronExpression(cronExpression);
console.log(result);