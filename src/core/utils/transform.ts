import { Vector2 } from '../elements'

export function calculateBoundsFromPoints(points: Vector2[]) {
  const x = Math.min(...points.map(p => p.x))
  const y = Math.min(...points.map(p => p.y))
  const maxX = Math.max(...points.map(p => p.x))
  const maxY = Math.max(...points.map(p => p.y))

  return {
    x,
    y,
    width: maxX - x,
    height: maxY - y,
  }
}
