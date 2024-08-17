export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formattedDate = date.toLocaleDateString("en-US", options);

  // Split the date string into parts
  const [monthDay, yearTime] = formattedDate.split(",");
  const [year, time] = yearTime.trim().split("at");

  const [month, day] = monthDay.trim().split(" ");
  const dayNum = parseInt(day);
  let daySuffix;

  if (dayNum > 3 && dayNum < 21) {
    daySuffix = "th";
  } else {
    switch (dayNum % 10) {
      case 1:
        daySuffix = "st";
        break;
      case 2:
        daySuffix = "nd";
        break;
      case 3:
        daySuffix = "rd";
        break;
      default:
        daySuffix = "th";
    }
  }

  // Reconstruct the date string with the ordinal day
  return `${month} ${day}${daySuffix}, ${year.trim()} at ${time.trim()}`;
};
