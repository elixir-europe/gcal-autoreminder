// Link need to pasted in the event description.
function extractLinksFromDescription(description) {
  const agendaMatch = description.match(/.*?Agenda:.*?<a href="(https:\/\/\S+)"/i);
  const zoomMatch = description.match(/.*?Zoom:.*?<a href="(https:\/\/\S+)"/i);
  return {
    zoom: zoomMatch ? zoomMatch[1] : null,
    agenda: agendaMatch ? agendaMatch[1] : null,
  };
}
