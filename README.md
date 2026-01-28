# gcal-autoreminder
Automated reminders for Google Calendar using Google Apps Script.

This project scans calendar events tagged with `CONFIG.reminderTag` and schedules reminder emails to event guests ahead of time. Reminders are scheduled by creating time-based triggers that send emails later.

## How it works
- `scheduleForCalendars()` runs on a schedule (daily) and scans calendars listed in `CONFIG.calendarIds`.
- For each calendar event on the target day(s), it looks for `CONFIG.reminderTag` in the event description.
- If found, it builds an email and creates a time-based trigger to send it later that day.
- When the trigger fires, `sendReminderEmailFromStore()` sends the email and logs it to a spreadsheet.

### Reminder timing
- Reminder offsets and time windows are configured in `CONFIG.reminderSchedules`.
- If a target reminder day lands on a weekend (as defined by `CONFIG.weekendDays`), it is pushed forward to the next workday.
- The script does not schedule new reminders on weekend days (also based on `CONFIG.weekendDays`).

## Project structure
- `Autoreminder.gs` — entry points and scheduling flow
- `CalendarUtils.gs` — parsing event description links
- **`Config.js`** — configuration
   - `spreadsheetLogId`: Spreadsheet ID for logs.
   - `calendarIds`: Array of calendar IDs.
   - `timezone`: Timezone used for day calculations.
   - `reminderTimezone`: Timezone used in email formatting.
   - `reminderTag`: Tag in event descriptions (e.g. `#reminder_email`).
   - `weekendDays`: ISO weekday numbers (1=Mon ... 7=Sun).
   - `reminderSchedules`: Array of objects `{ daysAhead, minHour, maxHour }`.
- `ConfigUtils.gs` — config validation and error email
- `DateUtils.gs` — date math and weekend handling
- `EmailScheduler.gs` — trigger storage + sending
- `ReminderComposer.gs` — email composition

<details>
<summary>Manual setup with Google Apps Script</summary>

1) Create a new Apps Script project in Google Drive.
2) Copy the files from this repo into the Apps Script project.
3) In `Config.js`, fill in:
   - `spreadsheetLogId` (spreadsheet that has a `Logs` sheet)
   - `calendarIds` (list of calendars to scan)
4) In the spreadsheet, ensure a sheet named `Logs` exists.

### Required OAuth scopes
Apps Script will prompt for permissions on first run:
- Calendar (read events)
- Mail (send email)
- Spreadsheet (write logs)
- Script (create time-based triggers)
</details>

<details>
<summary>Advanced setup with <i>clasp</i></summary>

### Prereqs
- Node.js installed
- `clasp` installed globally:

```sh
npm install -g @google/clasp
```

### Login and create
```sh
clasp login
clasp create --type standalone --title "gcal-autoreminder"
```

This creates a `.clasp.json` linked to your Apps Script project.

### Push code
From the repo directory:

```sh
clasp push
```

### Deploy (optional)
If you want a versioned deployment (e.g. for sharing or running as an add-on), create a deployment:

```sh
clasp deploy --description "Initial deployment"
```

List existing deployments:

```sh
clasp deployments
```

### Pull code (optional)
If you created the script in the Apps Script UI and want to download it:

```sh
clasp pull
```

</details>

## Configure triggers
Create a time-based trigger that runs `scheduleForCalendars()` once per weekday (or every day if you want it to decide). You can do this in the Apps Script UI or via `clasp`:

In the Apps Script UI:
- Triggers (clock icon) → Add Trigger
- Choose function: `scheduleForCalendars`
- Event source: Time-driven
- Type: Day timer (choose a time)

## Testing tips
- Add a test event with `CONFIG.reminderTag` in the description.
- Temporarily set a reminder schedule to `daysAhead: 0` and a narrow time window.
- Check the `Logs` sheet for sent emails.

## Notes
- Emails are sent as BCC to event guests; the "To" field is the script owner.
- The script avoids sending reminders on weekend days.
