import { useState } from 'react'
import { useViewTransition } from '../../src/react-vt'

const moods = [
  { emoji: '🙂', label: 'Happy' },
  { emoji: '😂', label: 'LOL' },
  { emoji: '😎', label: 'Chill' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🦄', label: "I'm a unicorn" },
]

export function MooodPicker() {
  const [currentMoodIndex, setCurrentMoodIndex] = useState(0)
  const { startViewTransition } = useViewTransition()
  return (
    <div>
      {moods.map(({ emoji }, index) => (
        <button
          onClick={() => {
            startViewTransition(() => {
              setCurrentMoodIndex(index)
            })
          }}
          disabled={index === currentMoodIndex}
        >
          <span
            style={{
              viewTransitionName:
                index === currentMoodIndex ? undefined : `mood-${index}`,
            }}
          >
            {emoji}
          </span>
        </button>
      ))}
      <div>
        <span
          style={{
            viewTransitionName: `mood-${currentMoodIndex}`,
            fontSize: '5em',
          }}
        >
          {moods[currentMoodIndex].emoji}
        </span>
        <div>{moods[currentMoodIndex].label}</div>
      </div>
    </div>
  )
}
