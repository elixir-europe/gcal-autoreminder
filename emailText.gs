function prepReminderForEvent(eventData) {
  const config = getConfigOrThrow();
  const links = extractLinksFromDescription(eventData.description);
  const weekday = eventData.startTime.toLocaleString('en-US', { weekday: 'long' });
  const time = Utilities.formatDate(eventData.startTime, config.reminderTimezone, 'HH:mm z');
  const dayMonth = Utilities.formatDate(eventData.startTime, config.reminderTimezone, 'dd MMM');

  let plainBody = `Hi,\n\nThis is a gentle reminder for the upcoming meeting "${eventData.title}" taking place next ${weekday} ${dayMonth} ${time}. Please review and add items to the agenda. \n\n`;
  let htmlBody = `<p>Hi,</p><p>This is a gentle reminder for the upcoming meeting <b>${eventData.title}</b> taking place next <b>${weekday}</b> ${dayMonth} at <b>${time}</b>. Please review and add items to the agenda.</p>`;

  if (links.agenda) {
    plainBody += `📄 Agenda: ${links.agenda}\n`;
    htmlBody += `<p>📄 <b>Agenda:</b> <a href="${links.agenda}">${links.agenda}</a></p>`;
  }

  if (links.zoom) {
    plainBody += `🔗 Zoom: ${links.zoom}\n`;
    htmlBody += `<p>🔗 <b>Zoom:</b> <a href="${links.zoom}">${links.zoom}</a></p>`;
  }

  plainBody += `\n\n— note: email generated automatically -`;
  htmlBody += `<p><i>— note: email generated automatically -</i></p>`;

  const recipients = [...new Set(eventData.guests)]; // remove duplicates

  const recipientChunks = chunkArray(recipients, 49);
  recipientChunks.forEach(chunk => {
    const preppedEmailData = {
      to: Session.getActiveUser().getEmail(),
      bcc: chunk.join(','),
      subject: `🔔 Reminder: ${eventData.title} next ${weekday}`,
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
