export default function Menu({ categories, onSelect }) {
  return (
    <div className="menu-container">
      <div className="menu-title">PIP Hub</div>
      <div className="menu-grid">
        {categories.map(category => (
          <button
            key={category}
            className="menu-button"
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
