function scheduleForCalendars() {
  const dayOfWeek = parseInt(Utilities.formatDate(new Date(), CONFIG.timezone, 'u'), 10);
  // If today is Saturday or Sunday, do not send reminders for tomorrow.
  if (CONFIG.weekendDays.indexOf(dayOfWeek) !== -1) return;

  CONFIG.reminderSchedules.forEach(schedule => {
    const increment = adjustIncrementForWeekend(new Date(), schedule.daysAhead);
    CONFIG.calendarIds.forEach(id =>
      scheduleTaggedReminders(id, schedule, increment)
    );
  });
}

function scheduleTaggedReminders(calendarId, schedule, increment) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) throw new Error(`Calendar not found: ${calendarId}`);
  const today = new Date();

  const targetDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + increment, 0, 0, 0);
  const endOfTargetDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + increment, 23, 59, 59);
  const events = calendar.getEvents(targetDay, endOfTargetDay);

  events.forEach(event => {
    const description = event.getDescription() || '';
    if (shouldScheduleReminderForEvent(description, schedule)) {
      console.log("remind: " + event.getTitle());
      // Choose a random time in the work day
      const randomHour = getRandomInt(schedule.minHour, schedule.maxHour);
      const randomMinute = getRandomInt(0, 59);
      const now = new Date();
      const triggerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), randomHour, randomMinute);
      const uid = Utilities.getUuid();
      
      const eventData = {
        uid: uid,
        title: event.getTitle(),
        startTime: event.getStartTime(),
        description: description,
        // This sends emails to everyone in the calendar event
        guests: event.getGuestList().map(g => g.getEmail()),
        // While testing, only sending reminder to myself for now
        // guests: []
        triggerTime: triggerTime
      };

      prepReminderForEvent(eventData);
    } else console.log("skip: " + event.getTitle());
  });
}
