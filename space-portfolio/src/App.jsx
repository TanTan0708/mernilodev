import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import Earth from './components/Earth'
import Planets from './components/Planets'
import Islands from './components/Islands'
import Player from './components/Player'
import Popup from './components/Popup'
import { game } from './game'
import { aboutMe, projects } from './data/portfolioData'

export default function App() {
  // popup is null (closed), { type: 'about' }, or { type: 'project', index: 3 }
  const [popup, setPopup] = useState({ type: 'about' }) // About Me opens at the start
  const [prompt, setPrompt] = useState(null)

  const handleLand = useCallback((index) => setPopup({ type: 'project', index }), [])
  const handleTakeOff = useCallback(() => setPopup(null), [])

  function closePopup() {
    // closing a project popup = taking off again
    if (game.mode === 'landed') game.mode = 'flying'
    setPopup(null)
  }

  let popupData = null
  if (popup?.type === 'about') popupData = aboutMe
  if (popup?.type === 'project') popupData = projects[popup.index]

  return (
    <div className="app">
      <Canvas camera={{ position: [0, 10, 15], fov: 60, near: 0.1, far: 3000 }}>
        <color attach="background" args={['#0d1033']} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[40, 60, 60]} intensity={2} />
        <Stars radius={300} depth={80} count={5000} factor={7} fade />

        <Planets />
        <Earth />
        <Islands />
        <Player
          onLand={handleLand}
          onTakeOff={handleTakeOff}
          onPrompt={setPrompt}
          islandTitles={projects.map((p) => p.title)}
        />
      </Canvas>

      {/* ---------- on-screen text ---------- */}
      <div className="hud-controls">
        <b>Controls</b>
        <div>W / S: walk or fly forward / back</div>
        <div>A / D: turn left / right</div>
        <div>Space / Shift: fly up / down</div>
        <div>E: board, land, or take off</div>
      </div>

      {!popupData && (
        <button className="hud-about" onClick={() => setPopup({ type: 'about' })}>
          About Me
        </button>
      )}

      {prompt && <div className="hud-prompt">{prompt}</div>}

      <Popup
        data={popupData}
        onClose={closePopup}
        closeLabel={popup?.type === 'project' ? 'Back to ship' : 'Close'}
      />
    </div>
  )
}
