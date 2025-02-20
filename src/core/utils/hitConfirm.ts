import { PointData } from 'pixi.js'

import { Position } from '../elements'

export type BoundsType = {
  x: number
  y: number
  width: number
  height: number
}

export function isPointInBounds(point: PointData, bounds: BoundsType) {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

// 判断点是否在多边形区域内
export function isPointInPointsArea(point: Position, rectPoints: Position[]) {
  let inside = false

  for (let i = 0, j = rectPoints.length - 1; i < rectPoints.length; j = i++) {
    const xi = rectPoints[i].x,
      yi = rectPoints[i].y
    const xj = rectPoints[j].x,
      yj = rectPoints[j].y

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}
