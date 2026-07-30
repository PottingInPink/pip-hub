export default function LogViewer({ entries }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="log-viewer">
      {entries.length === 0 ? (
        <div className="empty-state">No entries yet. Start logging to see them here.</div>
      ) : (
        entries.map(entry => (
          <div key={entry.id} className="log-entry">
            <div className="entry-timestamp">{formatDate(entry.timestamp)}</div>
            <div className="entry-text">{entry.text}</div>
          </div>
        ))
      )}
    </div>
  )
}
