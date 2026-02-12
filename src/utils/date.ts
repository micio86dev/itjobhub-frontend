/**
 * Formats a YYYY-MM-DD date string into a locale-aware format.
 * @param dateString - The date string to format (YYYY-MM-DD)
 * @param locale - The locale to use for formatting
 * @returns Formatted date string
 */
export const formatLocaleDate = (
  dateString: string | undefined,
  locale: string = "it",
): string => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
