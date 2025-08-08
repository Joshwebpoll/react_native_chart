// utils/formatChatTime.js
export function formatChatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const isYesterday = (() => {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  })();

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  if (isToday) {
    return new Intl.DateTimeFormat("en-US", timeOptions).format(date); // e.g., 2:45 PM
  } else if (isYesterday) {
    return "Yesterday";
  } else if (now.getFullYear() === date.getFullYear()) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date); // e.g., Aug 5
  } else {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date); // e.g., Aug 5, 2023
  }
}
