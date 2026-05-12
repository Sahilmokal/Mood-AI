export const themes = {

happy: {
  label: 'Happy',
  emoji: '😄',

  bg: 'linear-gradient(135deg,#3b2f00 0%,#7a6500 45%,#facc15 100%)',

  primary: '#ffffff',
  secondary: '#fef9c3',

  card: 'rgba(42,32,0,0.82)',
  border: '#fde047',

  button: '#facc15',
  buttonText: '#111111',

  orb1: '#facc15',
  orb2: '#fde047',
},

neutral: {
  label: 'Neutral',
  emoji: '🙂',

  bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)',

  primary: '#f8fafc',
  secondary: '#cbd5e1',

  card: 'rgba(15,23,42,0.72)',
  border: '#64748b',

  button: '#e2e8f0',
  buttonText: '#111111',

  orb1: '#64748b',
  orb2: '#94a3b8',
},

  sad: {
    label: 'Sad',
    emoji: '😔',

    bg: 'linear-gradient(135deg,#0f172a 0%,#172554 50%,#2563eb 100%)',

    primary: '#bfdbfe',
    secondary: '#dbeafe',

    card: 'rgba(10,20,40,0.75)',
    border: '#60a5fa',

    button: '#60a5fa',
    buttonText: '#ffffff',

    orb1: '#3b82f6',
    orb2: '#93c5fd',
  },

  angry: {
    label: 'Angry',
    emoji: '😡',

    bg: 'linear-gradient(135deg,#220000 0%,#7f1d1d 50%,#ef4444 100%)',

    primary: '#fecaca',
    secondary: '#fee2e2',

    card: 'rgba(40,0,0,0.75)',
    border: '#ef4444',

    button: '#ef4444',
    buttonText: '#ffffff',

    orb1: '#ef4444',
    orb2: '#f87171',
  },

  calm: {
    label: 'Calm',
    emoji: '😌',

    bg: 'linear-gradient(135deg,#042f2e 0%,#115e59 50%,#5eead4 100%)',

    primary: '#ccfbf1',
    secondary: '#f0fdfa',

    card: 'rgba(0,30,30,0.7)',
    border: '#2dd4bf',

    button: '#2dd4bf',
    buttonText: '#111111',

    orb1: '#14b8a6',
    orb2: '#5eead4',
  },

  stressed: {
    label: 'Stressed',
    emoji: '😵',

    bg: 'linear-gradient(135deg,#3b1d00 0%,#9a3412 50%,#fb923c 100%)',

    primary: '#ffedd5',
    secondary: '#fed7aa',

    card: 'rgba(60,25,0,0.72)',
    border: '#fdba74',

    button: '#fb923c',
    buttonText: '#111111',

    orb1: '#fdba74',
    orb2: '#fb923c',
  },

  energetic: {
    label: 'Energetic',
    emoji: '⚡',

    bg: 'linear-gradient(135deg,#2e1065 0%,#6b21a8 50%,#c084fc 100%)',

    primary: '#f3e8ff',
    secondary: '#e9d5ff',

    card: 'rgba(45,10,80,0.7)',
    border: '#c084fc',

    button: '#c084fc',
    buttonText: '#111111',

    orb1: '#a855f7',
    orb2: '#d8b4fe',
  },

  surprised: {
    label: 'Surprised',
    emoji: '😲',

    bg: 'linear-gradient(135deg,#4a044e 0%,#9d174d 50%,#f472b6 100%)',

    primary: '#fce7f3',
    secondary: '#fbcfe8',

    card: 'rgba(70,0,50,0.72)',
    border: '#f472b6',

    button: '#f472b6',
    buttonText: '#111111',

    orb1: '#ec4899',
    orb2: '#f9a8d4',
  },

  fearful: {
    label: 'Fearful',
    emoji: '😨',

    bg: 'linear-gradient(135deg,#111827 0%,#312e81 50%,#818cf8 100%)',

    primary: '#e0e7ff',
    secondary: '#c7d2fe',

    card: 'rgba(15,15,45,0.75)',
    border: '#818cf8',

    button: '#818cf8',
    buttonText: '#111111',

    orb1: '#6366f1',
    orb2: '#a5b4fc',
  },

  disgusted: {
    label: 'Disgusted',
    emoji: '🤢',

    bg: 'linear-gradient(135deg,#1a2e05 0%,#4d7c0f 50%,#a3e635 100%)',

    primary: '#f7fee7',
    secondary: '#ecfccb',

    card: 'rgba(30,50,0,0.72)',
    border: '#a3e635',

    button: '#a3e635',
    buttonText: '#111111',

    orb1: '#84cc16',
    orb2: '#d9f99d',
  }
}

export function getMoodTheme(mood) {
  return themes[mood?.toLowerCase()] || themes.neutral
}

export const getMood = getMoodTheme