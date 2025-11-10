/**
 * Highlights matching text in a string by wrapping matches in <mark> tags
 * Used for search result highlighting
 *
 * @param text - The full text to search in
 * @param query - The search query to highlight
 * @returns HTML string with <mark> tags around matches
 *
 * @example
 * highlightMatch("Bench Press", "ben")
 * // Returns: "<mark>Ben</mark>ch Press"
 */
export function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text;

  // Escape special regex characters in query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Case-insensitive global replace
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  // Replace matches with <mark> tags
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * Highlights multiple search terms in a string
 * Useful for multi-word searches
 *
 * @param text - The full text to search in
 * @param queries - Array of search terms to highlight
 * @returns HTML string with <mark> tags around all matches
 */
export function highlightMultipleMatches(
  text: string,
  queries: string[]
): string {
  if (!queries.length || !text) return text;

  let result = text;

  // Escape and combine all queries
  const escapedQueries = queries
    .filter((q) => q.trim())
    .map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escapedQueries.length === 0) return text;

  // Create regex with alternation
  const regex = new RegExp(`(${escapedQueries.join("|")})`, "gi");

  // Replace matches with <mark> tags
  return result.replace(regex, "<mark>$1</mark>");
}
