import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase'
import { PRODUCT_CATALOG, SIMPLE_PRODUCTS } from './productCatalog'
import { parseSalesText } from './salesParser'
import VoiceInput from './VoiceInput'
import TextInput from './TextInput'

const ALL_CATEGORY_NAMES = [...Object.keys(PRODUCT_CATALOG), ...SIMPLE_PRODUCTS]

export default function SalesTracker({ onBack }) {
const [stage, setStage] = useState('show-form')
const [show, setShow] = useState(null)
const [useVoice, setUseVoice] = useState(true)
const [parsedItems, setParsedItems] = useState([])
const [savedItems, setSavedItems] = useState([])

const [showDate, setShowDate] = useState('')
const [showName, setShowName] = useState('')
const [boothCost, setBoothCost] = useState('')

const handleCreateShow = async (e) => {
e.preventDefault()
try {
const cost = parseFloat(boothCost) || 0
const docRef = await addDoc(collection(db, 'shows'), {
name: showName,
date: showDate,
boothCost: cost,
createdAt: new Date().toISOString()
})
setShow({ id: docRef.id, name: showName, date: showDate, boothCost: cost })
setStage('logging')
} catch (error) {
console.error('Error creating show:', error)
alert('Error saving show. Try again.')
}
}

const handleSalesText = (text) => {
setParsedItems(parseSalesText(text))
setStage('review')
}

const updateParsedItem = (index, field, value) => {
setParsedItems(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
}

const removeParsedItem = (index) => {
setParsedItems(prev => prev.filter((_, i) => i !== index))
}

const addBlankItem = () => {
setParsedItems(prev => [
...prev,
{ raw: '', quantity: 1, category: '', variant: '', size: '', pattern: '', matched: true }
])
}

const handleConfirmSave = async () => {
const toSave = parsedItems.filter(item => item.category)
if (toSave.length === 0) {
alert('Pick a category for at least one item before saving.')
return
}
try {
for (const item of toSave) {
await addDoc(collection(db, 'sales'), {
showId: show.id,
category: item.category,
variant: item.variant || null,
size: item.size || null,
pattern: item.pattern || null,
quantity: item.quantity || 1,
rawText: item.raw,
timestamp: new Date().toISOString()
})
}
setSavedItems(prev => [...prev, ...toSave])
setParsedItems([])
setStage('logging')
} catch (error) {
console.error('Error saving sales:', error)
alert('Error saving items. Try again.')
}
}

const summary = summarize(savedItems)

return (
<div className="sales-tracker">
<div className="log-header">
<button onClick={onBack} className="back-button">Back</button>
<h1>Sales Tracking</h1>
<div style={{ width: '44px' }}></div>
</div>

{stage === 'show-form' && (
<form className="show-form" onSubmit={handleCreateShow}>
<label>
Show Date
<input type="date" value={showDate} onChange={(e) => setShowDate(e.target.value)} required />
</label>
<label>
Show Name
<input type="text" value={showName} onChange={(e) => setShowName(e.target.value)} required />
</label>
<label>
Booth Cost ($)
<input type="number" step="0.01" min="0" value={boothCost} onChange={(e) => setBoothCost(e.target.value)} required />
</label>
<button type="submit" className="submit-button">Start Tracking Sales</button>
</form>
)}

{stage === 'logging' && show && (
<>
<div className="show-info-banner">
<strong>{show.name}</strong> - {show.date} - Booth: ${show.boothCost.toFixed(2)}
</div>

<div className="input-section">
<div className="toggle-buttons">
<button className={'toggle' + (useVoice ? ' active' : '')} onClick={() => setUseVoice(true)}>Voice</button>
<button className={'toggle' + (!useVoice ? ' active' : '')} onClick={() => setUseVoice(false)}>Text</button>
</div>
{useVoice ? (
<VoiceInput onSubmit={handleSalesText} />
) : (
<TextInput onSubmit={handleSalesText} />
)}
</div>

{savedItems.length > 0 && (
<div className="sales-summary">
<h2>This Show So Far</h2>
{summary.map((group) => (
<div key={group.category} className="summary-category">
<div className="summary-category-name">{group.category} - {group.total}</div>
{group.variants.map((v) => (
<div key={v.name} className="summary-variant">{v.name}: {v.count}</div>
))}
</div>
))}
</div>
)}
</>
)}

{stage === 'review' && (
<div className="review-section">
<h2>Confirm what sold</h2>
{parsedItems.length === 0 && <div className="empty-state">Nothing to review. Go back and log some sales.</div>}
{parsedItems.map((item, i) => (
<div key={i} className="review-item">
<div className="review-raw">{item.raw}</div>
<div className="review-fields">
<label>
Qty
<input type="number" min="1" value={item.quantity} onChange={(e) => updateParsedItem(i, 'quantity', parseInt(e.target.value) || 1)} />
</label>
<label>
Category
<select value={item.category} onChange={(e) => updateParsedItem(i, 'category', e.target.value)}>
<option value="">-- pick --</option>
{ALL_CATEGORY_NAMES.map((name) => (
<option key={name} value={name}>{name}</option>
))}
</select>
</label>
{item.category && PRODUCT_CATALOG[item.category] && (
<label>
{PRODUCT_CATALOG[item.category].variantLabel || 'Variant'}
<input
type="text"
value={item.variant}
onChange={(e) => updateParsedItem(i, 'variant', e.target.value)}
list={'variant-options-' + i}
/>
<datalist id={'variant-options-' + i}>
{(PRODUCT_CATALOG[item.category].variants || []).map((v) => (
<option key={v} value={v} />
))}
</datalist>
</label>
)}
{item.category && PRODUCT_CATALOG[item.category]?.sizes && (
<label>
Size
<select value={item.size} onChange={(e) => updateParsedItem(i, 'size', e.target.value)}>
<option value="">--</option>
{PRODUCT_CATALOG[item.category].sizes.map((s) => (
<option key={s} value={s}>{s}</option>
))}
</select>
</label>
)}
{item.category && PRODUCT_CATALOG[item.category]?.hasPattern && (
<label>
Pattern (optional)
<input type="text" value={item.pattern} onChange={(e) => updateParsedItem(i, 'pattern', e.target.value)} />
</label>
)}
<button type="button" className="remove-item-button" onClick={() => removeParsedItem(i)}>Remove</button>
</div>
</div>
))}
<button type="button" className="add-item-button" onClick={addBlankItem}>+ Add Item</button>
<button type="button" className="submit-button" onClick={handleConfirmSave}>Save These Items</button>
</div>
)}
</div>
)
}

function summarize(items) {
const map = {}
for (const item of items) {
if (!map[item.category]) {
map[item.category] = { category: item.category, total: 0, variants: {} }
}
map[item.category].total += item.quantity || 1
const variantKey = item.variant || 'unspecified'
if (!map[item.category].variants[variantKey]) {
map[item.category].variants[variantKey] = 0
}
map[item.category].variants[variantKey] += item.quantity || 1
}
return Object.values(map).map((group) => ({
category: group.category,
total: group.total,
variants: Object.entries(group.variants).map(([name, count]) => ({ name, count }))
}))
}
