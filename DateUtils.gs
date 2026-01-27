function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function adjustIncrementForWeekend(today, increment) {
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + increment);
  // Advance up to 7 days until we land on a non-weekend day.
  for (let offset = 0; offset <= 7; offset += 1) {
    const adjusted = increment + offset;
    const candidate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + adjusted);
    const candidateDayIso = parseInt(Utilities.formatDate(candidate, CONFIG.timezone, 'u'), 10);
    if (CONFIG.weekendDays.indexOf(candidateDayIso) === -1) return adjusted;
  }
  // Fallback: return original increment if all 7 days are weekends.
  return increment;
}
