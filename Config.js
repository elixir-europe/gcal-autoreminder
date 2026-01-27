// Configuration and helpers.

const CONFIG = {
  timezone: 'Europe/London',
  reminderTimezone: 'Europe/Paris',
  reminderTag: '#reminder_email',
  // Calendar IDs to scan for reminders
  calendarIds: [

  ],
  weekendDays: [6, 7], // ISO weekday numbers (1=Mon ... 7=Sun)
  reminderSchedules: [ // the days ahead will skip weekends
    { daysAhead: 1, minHour: 8, maxHour: 11 },
    { daysAhead: 7, minHour: 12, maxHour: 15 },
  ],
};
