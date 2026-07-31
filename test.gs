/**
 * Schedules a one-off reminder approximately two minutes from now.
 *
 * This bypasses the normal reminder timing window while retaining the complete
 * email preparation, storage, trigger, and sending flow. The reminder is sent
 * only to the active user, never to the event's guests.
 */
function testReminderForEventNow() {
  const calendarId = 'your-calendar-id';
  const eventTitle = 'Exact event title';

  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) throw new Error(`Calendar not found: ${calendarId}`);

  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const event = calendar
    .getEvents(startOfDay, endOfDay)
    .find(item => item.getTitle() === eventTitle);

  if (!event) throw new Error(`Event not found: ${eventTitle}`);

  prepReminderForEvent({
    title: event.getTitle(),
    startTime: event.getStartTime(),
    description: event.getDescription() || '',
    guests: [Session.getActiveUser().getEmail()],
    triggerTime: new Date(Date.now() + 30 * 1000),
    reminderDaysAhead: 0,
  });
}
