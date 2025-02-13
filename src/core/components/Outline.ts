import { Graphics } from 'pixi.js'

import { DNode } from '../elements/DNode'
import { HoverElementEvent } from '../events'
import { outlineWidth, primaryColor } from '../config'

export interface IOutline {
  update: (element: DNode) => void
  show: () => void
  hide: () => void
}

export class Outline extends Graphics implements IOutline {
  node: DNode
  constructor(node: DNode) {
    super({
      x: 0,
      y: 0,
    })
    this.node = node
    this.visible = false

    this.engine.events.on('element:hover', (event: HoverElementEvent) => {
      if (event.data.source instanceof DNode && event.data.source === this.node) {
        this.update(event.data.source)
      } else {
        this.hide()
      }
    })
    this.engine.events.on('drag:move', this.handleDragMoveEvent.bind(this))
  }

  get engine() {
    return this.node.engine
  }

  handleDragMoveEvent() {
    this.hide()
  }

  update(element: DNode) {
    if (element.displayWidth && element.displayHeight) {
      const bounds = this.node.absRectPoints

      this.clear()
      this.moveTo(bounds[0].x, bounds[0].y) // 左上角
      this.lineTo(bounds[1].x, bounds[1].y) // 右上角
      this.lineTo(bounds[2].x, bounds[2].y) // 右下角
      this.lineTo(bounds[3].x, bounds[3].y) // 左下角
      this.lineTo(bounds[0].x, bounds[0].y) // 回到起点
      this.closePath()
      this.stroke({ color: primaryColor, pixelLine: false, width: outlineWidth })
      if (this.parent == null) {
        element.engine.outlineLayer?.addChild(this)
      }
      this.show()
    } else {
      this.hide()
      this.clear()
    }
  }

  show() {
    this.visible = true
  }

  hide() {
    this.visible = false
  }

  destroy() {
    this.parent.removeChild(this)
    super.destroy()
  }
}
