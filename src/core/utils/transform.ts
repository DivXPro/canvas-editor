import { Bounds } from 'pixi.js'

import { Position } from '../elements'

export function calculateBoundsFromPoints(points: Position[]) {
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

export function calculateAngleABC(A: Position, B: Position, C: Position): number {
  // 计算向量 BA 和 BC
  const BAx = A.x - B.x
  const BAy = A.y - B.y
  const BCx = C.x - B.x
  const BCy = C.y - B.y

  // 计算点积
  const dotProduct = BAx * BCx + BAy * BCy

  // 计算向量模长
  const magnitudeBA = Math.sqrt(BAx ** 2 + BAy ** 2)
  const magnitudeBC = Math.sqrt(BCx ** 2 + BCy ** 2)

  // 处理零向量情况
  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return NaN // 当 BA 或 BC 为零向量时返回 NaN
  }

  // 计算余弦值并限制在 [-1, 1] 范围内
  const cosine = dotProduct / (magnitudeBA * magnitudeBC)
  const clampedCosine = Math.max(-1, Math.min(1, cosine))

  // 计算弧度并转换为角度
  const angleRad = Math.acos(clampedCosine)
  let angleDeg = angleRad * (180 / Math.PI)

  // 计算叉积来判断角度方向
  const crossProduct = BAx * BCy - BAy * BCx

  // 如果叉积为负，说明是顺时针方向，角度需要改为 360 - angle
  if (crossProduct < 0) {
    angleDeg = 360 - angleDeg
  }

  return angleDeg
}

export function calculatePointsFromBounds(bounds: Bounds): Position[] {
  return [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ]
}
