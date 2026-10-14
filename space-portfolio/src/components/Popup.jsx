import { useState } from 'react'

// One picture. If the file is missing, show a gray box instead.
function Picture({ src, alt }) {
  const [missing, setMissing] = useState(false)

  if (missing) {
    return <div className="picture-missing">Put a picture here:<br />public{src}</div>
  }
  return <img src={src} alt={alt} onError={() => setMissing(true)} />
}

// The popup box: pictures on the left, text on the right.
export default function Popup({ data, onClose, closeLabel }) {
  if (!data) return null

  return (
    <div className="popup">
      <div className="popup-pictures">
        {data.images.map((src) => (
          <Picture key={src} src={src} alt={data.title} />
        ))}
      </div>

      <div className="popup-text">
        <h2>{data.title}</h2>
        <p>{data.description}</p>

        <div className="popup-buttons">
          {data.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="button">
              {link.label}
            </a>
          ))}
          <button className="button button-quiet" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
