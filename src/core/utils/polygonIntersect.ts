import { Position } from '../elements'

/**
 * 计算向量的点积
 */
function dotProduct(v1: Position, v2: Position): number {
  return v1.x * v2.x + v1.y * v2.y
}

/**
 * 获取多边形的投影轴
 * 对于每条边，获取其法向量作为投影轴
 */
function getProjectionAxes(points: Position[]): Position[] {
  const axes: Position[] = []
  const len = points.length

  for (let i = 0; i < len; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % len]

    // 计算边的向量
    const edge: Position = {
      x: p2.x - p1.x,
      y: p2.y - p1.y,
    }

    // 计算法向量（垂直于边的向量）
    const normal: Position = {
      x: -edge.y,
      y: edge.x,
    }

    // 归一化
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y)

    axes.push({
      x: normal.x / length,
      y: normal.y / length,
    })
  }

  return axes
}

/**
 * 计算多边形在指定轴上的投影
 */
function projectPolygon(points: Position[], axis: Position): { min: number; max: number } {
  let min = dotProduct(points[0], axis)
  let max = min

  for (let i = 1; i < points.length; i++) {
    const projection = dotProduct(points[i], axis)

    if (projection < min) {
      min = projection
    }
    if (projection > max) {
      max = projection
    }
  }

  return { min, max }
}

/**
 * 检查两个投影是否重叠
 */
function isOverlap(projection1: { min: number; max: number }, projection2: { min: number; max: number }): boolean {
  return !(projection1.max < projection2.min || projection2.max < projection1.min)
}

/**
 * 判断两个多边形是否相交
 * @param polygon1 第一个多边形的顶点数组
 * @param polygon2 第二个多边形的顶点数组
 * @returns 如果两个多边形相交返回 true，否则返回 false
 */
export function isPolygonsIntersect(polygon1: Position[], polygon2: Position[]): boolean {
  // 获取两个多边形的所有投影轴
  const axes1 = getProjectionAxes(polygon1)
  const axes2 = getProjectionAxes(polygon2)
  const axes = [...axes1, ...axes2]

  // 在每个轴上检查投影是否重叠
  for (const axis of axes) {
    const projection1 = projectPolygon(polygon1, axis)
    const projection2 = projectPolygon(polygon2, axis)

    // 如果在任意一个轴上没有重叠，则多边形不相交
    if (!isOverlap(projection1, projection2)) {
      return false
    }
  }

  // 所有轴上都有重叠，说明多边形相交
  return true
}

/**
 * 判断一个矩形和一个任意多边形是否相交的优化版本
 * 由于矩形只需要考虑水平和垂直两个投影轴，可以减少一半的计算量
 * @param rectPoints 矩形的顶点数组 [左上, 右上, 右下, 左下]
 * @param polygonPoints 多边形的顶点数组
 * @returns 如果矩形和多边形相交返回 true，否则返回 false
 */
export function isRectanglePolygonIntersect(rectPoints: Position[], polygonPoints: Position[]): boolean {
  // 确保输入的是矩形（4个顶点）
  if (rectPoints.length !== 4) {
    return false
  }

  // 获取矩形的两个投影轴（水平和垂直）
  const rectAxes: Position[] = [
    { x: 1, y: 0 }, // 水平轴
    { x: 0, y: 1 }  // 垂直轴
  ]

  // 获取多边形的所有投影轴
  const polygonAxes = getProjectionAxes(polygonPoints)
  const axes = [...rectAxes, ...polygonAxes]

  // 在每个轴上检查投影是否重叠
  for (const axis of axes) {
    const projection1 = projectPolygon(rectPoints, axis)
    const projection2 = projectPolygon(polygonPoints, axis)

    // 如果在任意一个轴上没有重叠，则不相交
    if (!isOverlap(projection1, projection2)) {
      return false
    }
  }

  // 所有轴上都有重叠，说明相交
  return true
}
