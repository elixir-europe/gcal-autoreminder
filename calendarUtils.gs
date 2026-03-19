// Link need to pasted in the event description.
function extractLinksFromDescription(description) {
  const agendaMatch = description.match(/.*?Agenda:.*?<a href="(https:\/\/\S+)"/i);
  const zoomMatch = description.match(/.*?Zoom:.*?<a href="(https:\/\/\S+)"/i);
  return {
    zoom: zoomMatch ? zoomMatch[1] : null,
    agenda: agendaMatch ? agendaMatch[1] : null,
  };
}

function getDescriptionTokens(description) {
  return description.split(/\s+/).filter(Boolean);
}

function getReminderDaysOverride(tokens) {
  const paramPrefix = `${CONFIG.reminderParam}=`;
  const paramToken = tokens.find(token => token.startsWith(paramPrefix));
  if (!paramToken) return null;

  const rawValue = paramToken.slice(paramPrefix.length);
  if (!/^\d+(,\d+)*$/.test(rawValue)) return null;

  return rawValue.split(',').map(value => parseInt(value, 10));
}

function shouldScheduleReminderForEvent(description, schedule) {
  if (!CONFIG.reminderTag || !CONFIG.reminderParam) return false;

  const tokens = getDescriptionTokens(description);
  if (tokens.indexOf(CONFIG.reminderTag) === -1) return false;

  const reminderDaysOverride = getReminderDaysOverride(tokens);
  if (!reminderDaysOverride) return true;

  return reminderDaysOverride.indexOf(schedule.daysAhead) !== -1;
}
