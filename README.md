# gcal-autoreminder
Automated reminders for Google Calendar using Google Apps Script.

This project scans calendar events for a shared reminder tag defined in `CONFIG.reminderTag` and schedules reminder emails to event guests ahead of time. Reminders are scheduled by creating time-based triggers that send emails later.

## How it works
- `scheduleForCalendars()` runs on a schedule (daily) and scans calendars listed in `CONFIG.calendarIds`.
- For each calendar event on the target day(s), it checks for `CONFIG.reminderTag`. If that tag is present on its own, the event gets the default reminders defined in `CONFIG.reminderSchedules`. If a matching reminder param is also present, it can narrow that down or opt in to same-day reminders.
- If the tag and schedule param match, it builds an email and creates a time-based trigger to send it later that day.
- When the trigger fires, `sendReminderEmailFromStore()` sends the email and logs it to a spreadsheet.

### Reminder timing
- Reminder offsets and time windows are configured in `CONFIG.reminderSchedules`.
- `daysAhead: 0` schedules a same-day reminder relative to the meeting start time, according to the value in `hoursBeforeEvent`.
- If a target reminder day lands on a weekend (as defined by `CONFIG.weekendDays`), it is pushed forward to the next workday.
- The script does not schedule new reminders on weekend days (also based on `CONFIG.weekendDays`).

### Reminder tags and params
The project config defines:
- `reminderTag`: Required marker that must appear in the event description.
- `reminderTag` on its own applies every configured reminder in `CONFIG.reminderSchedules` except `daysAhead: 0`.
- `daysAhead: 0` reminders are opt-in only and require the matching param, for example `reminder_days=0`.
- `reminderParam`: Shared parameter name used to restrict schedules by `daysAhead`, for example `reminder_days=1,7`.
- The param syntax is strict: use a single token like `reminder_days=1,7` with no spaces around `=`.

Example event description snippets:
- `#reminder_email` schedules the default non-zero reminders defined in `CONFIG.reminderSchedules`.
- `#reminder_email reminder_days=0` schedules only the same-day reminder.
- `#reminder_email reminder_days=1` schedules only the 1-day reminder.
- `#reminder_email reminder_days=1,7` schedules the 1-day and 7-day reminders.
- `Contact: Mike Anthony, m.a@my-org.org` adds the contact person to the reminder email footer and uses their email as the reminder's Reply-To address when the email domain matches `CONFIG.contactEmailDomain`.
- If you change `CONFIG.reminderTag` to `#board_reminder`, then `#board_reminder reminder_days=7` becomes the matching form.

### Calendar event description examples
Use the labels `Agenda:`, `Zoom:`, and `Contact:` in the event description. Put the reminder tag on its own line near the bottom so it is easy to spot and edit.

Default reminders, such as 1 day and 7 days ahead:

```text
Agenda: https://docs.google.com/document/d/mock-agenda-id/edit
Zoom: https://my-org.zoom.us/j/123456789?pwd=mockpass
Contact: Mike Anthony, m.a@my-org.org

#reminder_email
```

Same-day reminder only, sent according to the `daysAhead: 0` schedule:

```text
Agenda: https://docs.google.com/document/d/mock-agenda-id/edit
Zoom: https://my-org.zoom.us/j/123456789?pwd=mockpass
Contact: Mike Anthony, m.a@my-org.org

#reminder_email reminder_days=0
```

Same-day, 1-day, and 7-day reminders for the same event:

```text
Agenda: https://docs.google.com/document/d/mock-agenda-id/edit
Zoom: https://my-org.zoom.us/j/123456789?pwd=mockpass
Contact: Mike Anthony, m.a@my-org.org

#reminder_email reminder_days=0,1,7
```

## Project structure
- `autoreminder.gs` — entry points and scheduling flow
- `calendarUtils.gs` — parsing event description links and reminder schedule matching
- **`config.js`** — configuration
   - `spreadsheetLogId`: Spreadsheet ID for logs.
   - `calendarIds`: Array of calendar IDs.
   - `timezone`: Timezone used for day calculations.
   - `reminderTimezone`: Timezone used in email formatting.
   - `reminderTag`: Shared tag in event descriptions (for example `#reminder_email`).
   - `reminderParam`: Shared param in event descriptions (for example `reminder_days`).
   - `contactEmailDomain`: Allowed domain for `Contact:` email parsing (for example `my-org.org`).
   - `weekendDays`: ISO weekday numbers (1=Mon ... 7=Sun).
   - `reminderSchedules`: Array of objects. Future-day reminders use `{ daysAhead, minHour, maxHour }`; same-day reminders use `{ daysAhead: 0, hoursBeforeEvent }`.
- `dateUtils.gs` — date math and weekend handling
- `emailScheduler.gs` — trigger storage + sending
- `ReminderComposer.gs` — email composition

<details>
<summary>Manual setup with Google Apps Script</summary>

1) Create a new Apps Script project in Google Drive.
2) Copy the files from this repo into the Apps Script project.
3) In `config.js`, fill in:
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
- Add a test event with the shared reminder tag in the description, for example `#reminder_email` or `#reminder_email reminder_days=1`.
- Add `Contact: Mihail Anton, mihail.anton@my-org.org` to the event description to verify the contact block is appended near the bottom of the email.
- Send a test reminder and use your email client's Reply action to verify that it addresses the parsed contact email.
- Temporarily set a reminder schedule to `daysAhead: 0` with `hoursBeforeEvent` and use a test event far enough in the future for the trigger to be created.
- Check the `Logs` sheet for sent emails.

## Notes
- Emails are sent as BCC to event guests; the "To" field is the script owner.
- The script avoids sending reminders on weekend days.
