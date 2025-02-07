import { PointData } from 'pixi.js'

export type BoundsType = {
  x: number
  y: number
  width: number
  height: number
}

function isPointInBounds(point: PointData, bounds: BoundsType) {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}
