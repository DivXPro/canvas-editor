import { Position } from '../elements/type'

/**
 * 计算点到直线的垂直距离
 * @param point 点的坐标
 * @param lineStart 直线的起点
 * @param lineEnd 直线的终点
 * @returns 点到直线的垂直距离
 */
export function calculatePointToLineDistance(point: Position, lineStart: Position, lineEnd: Position): number {
  // 如果起点和终点重合，则返回点到起点的距离
  if (lineStart.x === lineEnd.x && lineStart.y === lineEnd.y) {
    return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2))
  }

  // 使用点到直线距离公式：|Ax + By + C| / sqrt(A^2 + B^2)
  // 其中 Ax + By + C = 0 为直线方程
  // A = y2 - y1
  // B = x1 - x2
  // C = x2*y1 - x1*y2
  const A = lineEnd.y - lineStart.y
  const B = lineStart.x - lineEnd.x
  const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y

  return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B)
}
