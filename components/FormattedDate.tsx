"use client";
import dayjs from "./_dayjs-tz-setup";

export default function FormattedDate({ date }: { date: string | number | Date }) {
  const formatted = dayjs(date).tz("Asia/Kolkata").format("MMM D, YYYY, h:mm A");
  return <span>{formatted}</span>;
}
