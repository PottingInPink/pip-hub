import { PRODUCT_CATALOG, SIMPLE_PRODUCTS } from './productCatalog'

const NUMBER_WORDS = {
    a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    couple: 2, few: 3, several: 4, dozen: 12
}

const COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'White', 'Black', 'Grey']

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function textIncludesWord(lower, word) {
    const w = word.toLowerCase().trim()
    if (!w) return false
    const base = w.endsWith('s') && w.length > 3 ? w.slice(0, -1) : w
    const re = new RegExp(`\\b${escapeRegex(base)}s?\\b`)
    return re.test(lower)
}

function extractQuantity(tokens) {
    if (tokens.length === 0) return { quantity: 1, rest: tokens }
    const first = tokens[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    if (/^\d+$/.test(first)) {
          return { quantity: parseInt(first, 10), rest: tokens.slice(1) }
    }
    if (NUMBER_WORDS[first] !== undefined) {
          return { quantity: NUMBER_WORDS[first], rest: tokens.slice(1) }
    }
    return { quantity: 1, rest: tokens }
}

function findCategory(lower) {
    for (const [name, def] of Object.entries(PRODUCT_CATALOG)) {
          const aliases = def.aliases || [name.toLowerCase()]
          for (const alias of aliases) {
                  if (textIncludesWord(lower, alias)) {
                            return { name, def }
                  }
          }
    }
    for (const name of SIMPLE_PRODUCTS) {
          if (textIncludesWord(lower, name)) {
                  return { name, def: null }
          }
    }
    return null
}

function findVariant(lower, def) {
    if (!def || !def.variants) return null
    for (const variant of def.variants) {
          if (textIncludesWord(lower, variant)) {
                  return variant
          }
    }
    return null
}

function findSize(lower, def) {
    if (!def || !def.sizes) return null
    for (const size of def.sizes) {
          const re = new RegExp(`\\b${escapeRegex(size.toLowerCase())}\\b`)
          if (re.test(lower)) return size
    }
    return null
}

function matchColorWord(word) {
    const w = word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word
    if (w === 'gray') return 'Grey'
    for (const color of COLORS) {
          if (color.toLowerCase() === w) return color
    }
    return null
}

function findColor(text) {
    for (const color of COLORS) {
          const re = new RegExp(`\\b${color.toLowerCase()}\\b`)
          if (re.test(text)) return color
    }
    if (/\bgray\b/.test(text)) return 'Grey'
    return null
}

function findColorBreakdown(text) {
    const words = text.split(/\s+/).filter(Boolean)
    const results = []
        for (let i = 0; i < words.length - 1; i++) {
              const w = words[i].toLowerCase().replace(/[^a-z0-9]/g, '')
              let qty = null
              if (/^\d+$/.test(w)) qty = parseInt(w, 10)
              else if (NUMBER_WORDS[w] !== undefined) qty = NUMBER_WORDS[w]
              if (qty !== null) {
                      const next = words[i + 1].toLowerCase().replace(/[^a-z0-9]/g, '')
                      const color = matchColorWord(next)
                      if (color) {
                                results.push({ quantity: qty, variant: color })
                      }
              }
        }
    return results
}

function isColorCategory(def) {
    return !!def && def.variantLabel === 'Color' && (!def.variants || def.variants.length === 0)
}

function parseChunk(chunk) {
    const tokens = chunk.split(/\s+/).filter(Boolean)
    const { quantity, rest } = extractQuantity(tokens)
    const restText = rest.join(' ')
    const lower = restText.toLowerCase()
    const fullLower = chunk.toLowerCase()

  const match = findCategory(lower)

  if (!match) {
        return [{
                raw: chunk,
                quantity,
                category: '',
                variant: '',
                size: '',
                pattern: '',
                matched: false
        }]
  }

  if (isColorCategory(match.def)) {
        const breakdown = findColorBreakdown(fullLower)
        if (breakdown.length > 0) {
                return breakdown.map(b => ({
                          raw: chunk,
                          quantity: b.quantity,
                          category: match.name,
                          variant: b.variant,
                          size: '',
                          pattern: '',
                          matched: true
                }))
        }
        return [{
                raw: chunk,
                quantity,
                category: match.name,
                variant: findColor(fullLower) || '',
                size: '',
                pattern: '',
                matched: true
        }]
  }

  const variant = findVariant(lower, match.def) || ''
    const size = findSize(lower, match.def) || ''

  return [{
        raw: chunk,
        quantity,
        category: match.name,
        variant,
        size,
        pattern: '',
        matched: true
  }]
}

export function parseSalesText(text) {
    if (!text || !text.trim()) return []

        const chunks = text
      .split(/,|\n|\band\b/i)
      .map(c => c.trim())
      .filter(Boolean)

  return chunks.flatMap(chunk => parseChunk(chunk))
}
