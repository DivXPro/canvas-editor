import { Graphics } from 'pixi.js'

import { Position } from '../nodes'

export interface SelectionAreaOptions {
  x?: number
  y?: number
  width?: number
  height?: number
}

export class SelectionArea extends Graphics {
  constructor(options: SelectionAreaOptions = {}) {
    super()
    const { x = 0, y = 0, width = 0, height = 0 } = options

    this.position.set(x, y)
    this.draw(0, 0, width, height)
  }

  draw(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.clear()
    // 绘制半透明的填充
    this.rect(x, y, width, height)
      .fill({ color: 0x0066ff, alpha: 0.1 })
      .stroke({ color: 0x0066ff, width: 1, alpha: 0.8 })
  }

  update(start: Position, end: Position) {
    this.position.set(start.x, start.y)
    let width = end.x - start.x
    let height = end.y - start.y
    let drawX = 0
    let drawY = 0

    // 处理宽度为负数的情况（当前点在起始点左侧）
    if (width < 0) {
      width = Math.abs(width)
      drawX = -width
    }

    // 处理高度为负数的情况（当前点在起始点上方）
    if (height < 0) {
      height = Math.abs(height)
      drawY = -height
    }

    this.draw(drawX, drawY, width, height)
  }
}
