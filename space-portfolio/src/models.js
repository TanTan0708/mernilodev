// This file automatically finds every .glb / .gltf file inside
// the "src/models" folder. You do NOT need to edit it.
//
// File names matter! "earth.glb" replaces the Earth placeholder,
// "sun.glb" replaces the Sun, and so on. Capital letters don't matter.

const files = import.meta.glob('./models/*.{glb,gltf}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// Make a simple list like { earth: '/src/models/earth.glb', sun: '...' }
const found = {}
for (const path in files) {
  const name = path.split('/').pop().replace(/\.(glb|gltf)$/i, '').toLowerCase()
  found[name] = files[path]
}

// Give it a list of possible names, get back the first one that exists.
// Example: getModelUrl(['island3', 'island']) tries island3.glb first, then island.glb.
export function getModelUrl(names) {
  for (const name of names) {
    if (found[name]) return found[name]
  }
  return null // no file found -> the app uses the placeholder shape
}
