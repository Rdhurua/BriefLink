// lib/ics.ts
export  function buildICS(actionItems: { title: string; due?: string }[]) {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Notes//EN",
  ];

  actionItems.forEach((item, i) => {
    const uid = `item-${i}-${now}@ainotes`;
    const dt = item.due ? new Date(item.due) : null;
    const end = dt ? new Date(dt.getTime() + 30 * 60 * 1000) : null;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      dt ? `DTSTART:${dt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z` : `DTSTART:${now}`,
      end ? `DTEND:${end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z` : `DTEND:${now}`,
      `SUMMARY:${(item.title || "Action Item").replace(/\r?\n/g, " ")}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
