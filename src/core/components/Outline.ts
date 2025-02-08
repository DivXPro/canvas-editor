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
      if (event.data.source instanceof DNode) {
        this.update(event.data.source)
      } else {
        this.hide()
      }
    })
  }

  get engine() {
    return this.node.engine
  }

  update(element: DNode) {
    if (element.displayWidth && element.displayHeight) {
      this.position.set(element.globalCenter.x, element.globalCenter.y)
      this.clear()
        .rect(-element.displayWidth / 2, -element.displayHeight / 2, element.displayWidth, element.displayHeight)
        .stroke({ color: primaryColor, width: outlineWidth })
      this.pivot.set(0, 0)
      this.rotation = element.rotation ?? 0
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
