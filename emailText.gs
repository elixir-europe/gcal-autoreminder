function prepReminderForEvent(eventData) {
  const details = extractEventDetailsFromDescription(eventData.description);
  const weekday = eventData.startTime.toLocaleString('en-US', { weekday: 'long' });
  const time = Utilities.formatDate(eventData.startTime, CONFIG.reminderTimezone, 'HH:mm z');
  const dayMonth = Utilities.formatDate(eventData.startTime, CONFIG.reminderTimezone, 'dd MMM');

  let plainBody = `Hi,\n\nThis is a gentle reminder for the upcoming meeting "${eventData.title}" taking place next ${weekday} ${dayMonth} ${time}. Please review and add items to the agenda. \n\n`;
  let htmlBody = `<p>Hi,</p><p>This is a gentle reminder for the upcoming meeting <b>${escapeHtml(eventData.title)}</b> taking place next <b>${weekday}</b> ${dayMonth} at <b>${time}</b>. Please review and add items to the agenda.</p>`;

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
