import { useEffect, useState } from 'react'

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })

    handler() // initialer Call
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return size // { width, height }
}
