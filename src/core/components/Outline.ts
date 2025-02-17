import { Graphics } from 'pixi.js'

import { DNode } from '../elements/DNode'
import { HoverElementEvent } from '../events'
import { outlineWidth, primaryColor } from '../config'

export interface IOutline {
  update: (node: DNode) => void
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

  update(node: DNode) {
    if (node.displayWidth && node.displayHeight) {
      console.debug(
        'outline',
        node.center,
        node.globalCenter.x,
        node.globalCenter.y,
        node.displayWidth,
        node.displayHeight
      )

      this.clear()
      this.position.set(node.globalCenter.x, node.globalCenter.y)
      this.pivot.set(node.displayWidth / 2, node.displayHeight / 2)

      this.rect(0, 0, node.displayWidth, node.displayHeight).stroke({ color: primaryColor, width: outlineWidth })

      this.rotation = node.globalRotation
      if (this.parent == null) {
        node.engine.outlineLayer?.addChild(this)
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
