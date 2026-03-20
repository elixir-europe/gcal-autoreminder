// Link need to pasted in the event description.
function extractEventDetailsFromDescription(description) {
  const agendaMatch = description.match(/.*?Agenda:.*?<a href="(https:\/\/\S+)"/i);
  const zoomMatch = description.match(/.*?Zoom:.*?<a href="(https:\/\/\S+)"/i);
  const contactMatch = CONFIG.contactEmailDomain
    ? description.match(
        new RegExp(
          `Contact:\\s*([^,]+),\\s*(\\S+@${CONFIG.contactEmailDomain})\\b`,
          'i'
        )
      )
    : null;

  return {
    zoom: zoomMatch ? zoomMatch[1] : null,
    agenda: agendaMatch ? agendaMatch[1] : null,
    contact: contactMatch
      ? {
          name: cleanHtmlText(contactMatch[1].trim()),
          email: contactMatch[2].trim(),
        }
      : null,
  };
}

function getDescriptionTokens(description) {
  return description.split(/<|>|\s+/).filter(Boolean);
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

function cleanHtmlText(value) {
  return unescapeHtml(String(value))
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unescapeHtml(value) {
  return String(value)
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');
}
