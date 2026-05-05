export const MOODS = {
  happy:     { emoji: '😊', label: 'Happy',     color: '#c8ff00', tag: 'volt',   desc: 'Radiating good energy' },
  sad:       { emoji: '😢', label: 'Sad',        color: '#60a5fa', tag: 'blue',   desc: 'Processing the feels' },
  angry:     { emoji: '😠', label: 'Angry',      color: '#ff4f7b', tag: 'rose',   desc: 'Fired up and intense' },
  stressed:  { emoji: '😰', label: 'Stressed',   color: '#ffb830', tag: 'amber',  desc: 'Under pressure right now' },
  fearful:   { emoji: '😨', label: 'Fearful',    color: '#a78bfa', tag: 'violet', desc: 'Navigating uncertainty' },
  surprised: { emoji: '😲', label: 'Surprised',  color: '#00ffc8', tag: 'aurora', desc: 'Something unexpected hit' },
  disgusted: { emoji: '😒', label: 'Disgusted',  color: '#4ade80', tag: 'green',  desc: 'Not feeling it today' },
  calm:      { emoji: '😌', label: 'Calm',       color: '#00ffc8', tag: 'aurora', desc: 'In a peaceful state' },
  energetic: { emoji: '⚡', label: 'Energetic',  color: '#c8ff00', tag: 'volt',   desc: 'Full of drive and power' },
  neutral:   { emoji: '😐', label: 'Neutral',    color: '#9898b8', tag: 'dim',    desc: 'Steady and balanced' },
}

export function getMood(key) {
  return MOODS[(key || 'neutral').toLowerCase()] || MOODS.neutral
}
