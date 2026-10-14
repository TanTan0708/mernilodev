// A tiny shared "scoreboard" that every file can read.
// mode is one of:
//   'walking' -> astronaut is walking on Earth
//   'flying'  -> astronaut is inside the spaceship, flying around
//   'landed'  -> ship is parked on an island and the popup is open
export const game = {
  mode: 'walking',
  islandIndex: null, // which island we are on (0 to 15)
  keys: {}, // which keyboard keys are being held down right now
}
