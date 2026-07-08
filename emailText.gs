function prepReminderForEvent(eventData) {
  const details = extractEventDetailsFromDescription(eventData.description);
  const weekday = eventData.startTime.toLocaleString('en-US', { weekday: 'long' });
  const time = Utilities.formatDate(eventData.startTime, CONFIG.reminderTimezone, 'HH:mm z');
  const dayMonth = Utilities.formatDate(eventData.startTime, CONFIG.reminderTimezone, 'dd MMM');
  const datePhrase = getReminderDatePhrase(eventData, weekday);

  let plainBody = `Hi,\n\nThis is a gentle reminder for the upcoming meeting "${eventData.title}" taking place ${datePhrase} ${dayMonth} ${time}. Please review and add items to the agenda. \n\n`;
  let htmlBody = `<p>Hi,</p><p>This is a gentle reminder for the upcoming meeting <b>${escapeHtml(eventData.title)}</b> taking place ${formatReminderDatePhraseHtml(eventData, weekday)} ${dayMonth} at <b>${time}</b>. Please review and add items to the agenda.</p>`;

  if (details.agenda) {
    plainBody += `📄 Agenda: ${details.agenda}\n`;
    htmlBody += `<p>📄 <b>Agenda:</b> <a href="${details.agenda}">${details.agenda}</a></p>`;
  }

  if (details.zoom) {
    plainBody += `🔗 Zoom: ${details.zoom}\n`;
    htmlBody += `<p>🔗 <b>Zoom:</b> <a href="${details.zoom}">${details.zoom}</a></p>`;
  }

  if (details.contact) {
    plainBody += `Contact: ${details.contact.name}, ${details.contact.email}\n`;
    htmlBody += `<p><b>Contact:</b> ${escapeHtml(details.contact.name)}, <a href="mailto:${details.contact.email}">${details.contact.email}</a></p>`;
  }

  plainBody += `\n\n\n— note: email generated automatically with https://github.com/elixir-europe/gcal-autoreminder -`;
  htmlBody += `<br><p><i>— note: email generated automatically (<a href="https://github.com/elixir-europe/gcal-autoreminder">source code</a>) -</i></p>`;

  const recipients = [...new Set(eventData.guests)]; // remove duplicates

  const recipientChunks = chunkArray(recipients, 49);
  recipientChunks.forEach(chunk => {
    const preppedEmailData = {
      to: Session.getActiveUser().getEmail(),
      bcc: chunk.join(','),
      subject: `🔔 Reminder: ${eventData.title} ${datePhrase}`,
      plainBody: plainBody,
      htmlBody: htmlBody,
      triggerTime: eventData.triggerTime
    };
    scheduleEmail(preppedEmailData);
  });
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function getReminderDatePhrase(eventData, weekday) {
  if (shouldUseTomorrowPhrase(eventData, weekday)) {
    return `tomorrow ${weekday}`;
  }
  return `next ${weekday}`;
}

function formatReminderDatePhraseHtml(eventData, weekday) {
  const prefix = shouldUseTomorrowPhrase(eventData, weekday) ? 'tomorrow' : 'next';
  return `${prefix} <b>${weekday}</b>`;
}

function shouldUseTomorrowPhrase(eventData, weekday) {
  const tomorrowWeekdays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return eventData.reminderDaysAhead === 1
    && tomorrowWeekdays.indexOf(weekday) !== -1;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
