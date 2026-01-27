function scheduleEmail(preppedEmailData) {
  const trigger = ScriptApp.newTrigger('sendReminderEmailFromStore')
    .timeBased()
    .at(preppedEmailData.triggerTime)
    .create();
  const triggerId = trigger.getUniqueId();
  PropertiesService.getScriptProperties().setProperty(`trigger_${triggerId}`, JSON.stringify(preppedEmailData));
}

/**
* Trigger handler. Receives an event object whose `triggerId` identifies
* the specific time-based trigger that fired. We use that to (a) send only the matching email and (b) delete that trigger.
*/
function sendReminderEmailFromStore(e) {
  const props = PropertiesService.getScriptProperties();
  const uid = e && e.triggerUid;
  if (!uid) return; // Defensive: should always exist for installable triggers.

  const key = `trigger_${uid}`;
  const payloadJson = props.getProperty(key);
  if (!payloadJson) {
    // Nothing stored for this trigger; best-effort cleanup of the trigger itself.
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(t => {
      if (t.getUniqueId && t.getUniqueId() === uid) {
        ScriptApp.deleteTrigger(t);
      }
    });
    return;
  }

  const eventData = JSON.parse(payloadJson);
  MailApp.sendEmail({
    to: eventData.to,
    bcc: eventData.bcc,
    subject: eventData.subject,
    body: eventData.plainBody,
    htmlBody: eventData.htmlBody,
  });

  // Remove the stored payload.
  props.deleteProperty(key);

  // Delete only the trigger that fired.
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getUniqueId && t.getUniqueId() === uid) {
      ScriptApp.deleteTrigger(t);
    }
  });

  const config = getConfigOrThrow();
  var sheet = SpreadsheetApp.openById(config.spreadsheetLogId).getSheetByName('Logs');

  // Create an array of values you want to log
  var rowData = [
    new Date(),
    eventData.to,
    eventData.bcc,
    eventData.subject,
    eventData.htmlBody,
    eventData.triggerTime
  ];

  // Append the new row of data
  sheet.appendRow(rowData);
}
