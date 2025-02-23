import { PointData } from 'pixi.js'

import { Position } from '../nodes'

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
export function isPointInPointsArea(point: Position, vertices: Position[]) {
  let inside = false

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x,
      yi = vertices[i].y
    const xj = vertices[j].x,
      yj = vertices[j].y

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

export function isPointInCurvedPolygon(point: Position, curvePoints: Position[], segmentCount: number = 32): boolean {
  // 1. 将曲线离散化为更多的直线段
  const discretizedPoints: Position[] = []

  for (let i = 0; i < curvePoints.length; i++) {
    const p1 = curvePoints[i]
    const p2 = curvePoints[(i + 1) % curvePoints.length]

    // 在两点之间插入更多的点
    for (let j = 0; j < segmentCount; j++) {
      const t = j / segmentCount

      discretizedPoints.push({
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
      })
    }
  }

  // 2. 使用常规的点在多边形内判断方法
  return isPointInPointsArea(point, discretizedPoints)
}
