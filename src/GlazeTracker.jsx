import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { GLAZE_BRANDS_WITH_SERIES, ALL_GLAZE_BRANDS } from './glazeCatalog'
import { parseGlazeNames } from './glazeParser'
import VoiceInput from './VoiceInput'
import TextInput from './TextInput'

export default function GlazeTracker({ onBack }) {
  const [stage, setStage] = useState('brand-select')
  const [brand, setBrand] = useState(null)
  const [series, setSeries] = useState(null)
  const [useVoice, setUseVoice] = useState(true)
  const [parsedItems, setParsedItems] = useState([])
  const [glazes, setGlazes] = useState([])
  const [loading, setLoading] = useState(false)

  const loadGlazes = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'glazes'))
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setGlazes(all)
    } catch (error) {
      console.error('Error loading glazes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (stage === 'inventory') {
      loadGlazes()
    }
  }, [stage])

  const handleSelectBrand = (b) => {
    setBrand(b)
    if (GLAZE_BRANDS_WITH_SERIES[b]) {
      setStage('series-select')
    } else {
      setSeries(null)
      setStage('logging')
    }
  }

  const handleSelectSeries = (s) => {
    setSeries(s)
    setStage('logging')
  }

  const handleGlazeText = (text) => {
    setParsedItems(parseGlazeNames(text))
    setStage('review')
  }

  const updateParsedItem = (index, value) => {
    setParsedItems(prev => prev.map((item, i) => (i === index ? { name: value } : item)))
  }

  const removeParsedItem = (index) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index))
  }

  const addBlankItem = () => {
    setParsedItems(prev => [...prev, { name: '' }])
  }

  const handleConfirmSave = async () => {
    const toSave = parsedItems.filter(item => item.name && item.name.trim())
    if (toSave.length === 0) {
      alert('Add at least one glaze name before saving.')
      return
    }
    try {
      for (const item of toSave) {
        await addDoc(collection(db, 'glazes'), {
          brand,
          series: series || null,
          name: item.name.trim(),
          createdAt: new Date().toISOString()
        })
      }
      setParsedItems([])
      setStage('logging')
    } catch (error) {
      console.error('Error saving glazes:', error)
      alert('Error saving glazes. Try again.')
    }
  }

  const handleRemoveGlaze = async (id) => {
    try {
      await deleteDoc(doc(db, 'glazes', id))
      setGlazes(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error('Error removing glaze:', error)
      alert('Error removing glaze. Try again.')
    }
  }

  const handleChangeBrand = () => {
    setBrand(null)
    setSeries(null)
    setParsedItems([])
    setStage('brand-select')
  }

  const grouped = groupGlazes(glazes)

  return (
    <div className="glaze-tracker">
      <div className="log-header">
        <button onClick={onBack} className="back-button">Back</button>
        <h1>Glaze Inventory</h1>
        <div style={{ width: '44px' }}></div>
      </div>

      {stage !== 'inventory' && stage !== 'review' && (
        <button type="button" className="link-button" onClick={() => setStage('inventory')}>View Full Inventory</button>
      )}

      {stage === 'brand-select' && (
        <div className="brand-select">
          <h2>Pick a Brand</h2>
          <div className="brand-grid">
            {ALL_GLAZE_BRANDS.map((b) => (
              <button key={b} type="button" className="brand-button" onClick={() => handleSelectBrand(b)}>{b}</button>
            ))}
          </div>
        </div>
      )}

      {stage === 'series-select' && brand && (
        <div className="brand-select">
          <h2>{brand} - Pick a Series</h2>
          <div className="brand-grid">
            {GLAZE_BRANDS_WITH_SERIES[brand].map((s) => (
              <button key={s} type="button" className="brand-button" onClick={() => handleSelectSeries(s)}>{s}</button>
            ))}
          </div>
          <button type="button" className="link-button" onClick={handleChangeBrand}>Change Brand</button>
        </div>
      )}

      {stage === 'logging' && brand && (
        <>
          <div className="glaze-info-banner">
            <span><strong>{brand}</strong>{series ? ' - ' + series : ''}</span>
            <button type="button" className="link-button" onClick={handleChangeBrand}>Change</button>
          </div>

          <div className="input-section">
            <div className="toggle-buttons">
              <button className={'toggle' + (useVoice ? ' active' : '')} onClick={() => setUseVoice(true)}>Voice</button>
              <button className={'toggle' + (!useVoice ? ' active' : '')} onClick={() => setUseVoice(false)}>Text</button>
            </div>
            {useVoice ? (
              <VoiceInput onSubmit={handleGlazeText} />
            ) : (
              <TextInput onSubmit={handleGlazeText} />
            )}
          </div>
        </>
      )}

      {stage === 'review' && (
        <div className="review-section">
          <h2>Confirm glaze names</h2>
          {parsedItems.length === 0 && <div className="empty-state">Nothing to review. Go back and list some glazes.</div>}
          {parsedItems.map((item, i) => (
            <div key={i} className="review-item">
              <div className="review-fields">
                <label>
                  Glaze Name
                  <input type="text" value={item.name} onChange={(e) => updateParsedItem(i, e.target.value)} />
                </label>
                <button type="button" className="remove-item-button" onClick={() => removeParsedItem(i)}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" className="add-item-button" onClick={addBlankItem}>+ Add Glaze</button>
          <button type="button" className="submit-button" onClick={handleConfirmSave}>Save These Glazes</button>
        </div>
      )}

      {stage === 'inventory' && (
        <div className="glaze-inventory">
          <button type="button" className="link-button" onClick={() => setStage(brand ? 'logging' : 'brand-select')}>Back to Adding Glazes</button>
          {loading && <div className="empty-state">Loading...</div>}
          {!loading && grouped.length === 0 && <div className="empty-state">No glazes logged yet.</div>}
          {grouped.map((brandGroup) => (
            <div key={brandGroup.brand} className="inventory-brand">
              <h2>{brandGroup.brand}</h2>
              {brandGroup.seriesGroups.map((seriesGroup) => (
                <div key={seriesGroup.series || 'none'} className="inventory-series">
                  {seriesGroup.series && <h3>{seriesGroup.series}</h3>}
                  {seriesGroup.items.map((g) => (
                    <div key={g.id} className="inventory-item">
                      <span>{g.name}</span>
                      <button type="button" className="remove-item-button" onClick={() => handleRemoveGlaze(g.id)}>Out of it</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupGlazes(glazes) {
  const brandMap = {}
  for (const g of glazes) {
    const brandKey = g.brand || 'Other'
    if (!brandMap[brandKey]) brandMap[brandKey] = {}
    const seriesKey = g.series || ''
    if (!brandMap[brandKey][seriesKey]) brandMap[brandKey][seriesKey] = []
    brandMap[brandKey][seriesKey].push(g)
  }
  const brandNames = Object.keys(brandMap).sort((a, b) => a.localeCompare(b))
  return brandNames.map((brand) => {
    const seriesKeys = Object.keys(brandMap[brand]).sort((a, b) => a.localeCompare(b))
    return {
      brand,
      seriesGroups: seriesKeys.map((series) => ({
        series: series || null,
        items: brandMap[brand][series].slice().sort((a, b) => a.name.localeCompare(b.name))
      }))
    }
  })
}
