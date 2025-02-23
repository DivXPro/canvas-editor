import { Position } from '../nodes'

import { isPointInPointsArea } from './hitConfirm'

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
    { x: 0, y: 1 }, // 垂直轴
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

/**
 * 将椭圆离散化为多边形
 * @param center 椭圆中心点
 * @param radiusX 椭圆X轴半径
 * @param radiusY 椭圆Y轴半径
 * @param rotation 椭圆旋转角度（弧度）
 * @param segments 离散化后的线段数量
 * @returns 近似椭圆的多边形顶点数组
 */
function discretizeEllipse(
  center: Position,
  radiusX: number,
  radiusY: number,
  rotation: number,
  segments: number = 32
): Position[] {
  const points: Position[] = []
  const step = (Math.PI * 2) / segments

  for (let i = 0; i < segments; i++) {
    const angle = i * step
    // 参数方程
    const x = radiusX * Math.cos(angle)
    const y = radiusY * Math.sin(angle)

    // 旋转变换
    const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation)
    const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation)

    // 平移到椭圆中心
    points.push({
      x: center.x + rotatedX,
      y: center.y + rotatedY,
    })
  }

  return points
}

/**
 * 判断圆形和多边形是否相交
 * 相比椭圆，圆形的相交检测可以更加高效
 * @param center 圆心坐标
 * @param radius 圆的半径
 * @param polygonPoints 多边形的顶点数组
 * @returns 如果圆形和多边形相交返回 true，否则返回 false
 */
export function isCirclePolygonIntersect(center: Position, radius: number, polygonPoints: Position[]): boolean {
  // 1. 首先检查圆心是否在多边形内部
  if (isPointInPointsArea(center, polygonPoints)) {
    return true
  }

  // 2. 检查多边形的每条边是否与圆相交
  const len = polygonPoints.length

  for (let i = 0; i < len; i++) {
    const p1 = polygonPoints[i]
    const p2 = polygonPoints[(i + 1) % len]

    // 计算点到线段的最短距离
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const length = Math.sqrt(dx * dx + dy * dy)

    // 如果线段长度为0，则检查端点到圆心的距离
    if (length === 0) {
      const distance = Math.sqrt((p1.x - center.x) * (p1.x - center.x) + (p1.y - center.y) * (p1.y - center.y))

      if (distance <= radius) {
        return true
      }
      continue
    }

    // 计算圆心到线段的投影点
    const t = Math.max(0, Math.min(1, ((center.x - p1.x) * dx + (center.y - p1.y) * dy) / (length * length)))

    const projectionX = p1.x + t * dx
    const projectionY = p1.y + t * dy

    // 计算圆心到投影点的距离
    const distance = Math.sqrt(
      (center.x - projectionX) * (center.x - projectionX) + (center.y - projectionY) * (center.y - projectionY)
    )

    if (distance <= radius) {
      return true
    }
  }

  return false
}

/**
 * 判断椭圆和多边形是否相交
 * @param center 椭圆中心点
 * @param radiusX 椭圆X轴半径
 * @param radiusY 椭圆Y轴半径
 * @param rotation 椭圆旋转角度（弧度）
 * @param polygonPoints 多边形的顶点数组
 * @returns 如果椭圆和多边形相交返回 true，否则返回 false
 */
export function isEllipsePolygonIntersect(
  center: Position,
  radiusX: number,
  radiusY: number,
  rotation: number,
  polygonPoints: Position[]
): boolean {
  // 将椭圆离散化为多边形
  const ellipsePoints = discretizeEllipse(center, radiusX, radiusY, rotation)

  // 使用多边形相交检测算法
  return isPolygonsIntersect(ellipsePoints, polygonPoints)
}
