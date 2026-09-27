export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
};