export function parseGlazeNames(text) {
    if (!text || !text.trim()) return []

        const chunks = text
      .split(/,|\n|\band\b/i)
      .map(c => c.trim())
      .filter(Boolean)

  return chunks.map(name => ({ name }))
}
