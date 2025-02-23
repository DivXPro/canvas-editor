import { Graphics } from 'pixi.js'

import { DNode } from '../nodes/DNode'
import { outlineWidth, outlineWidth2, primaryColor } from '../config'

export interface IOutline {
  update: () => void
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
  }

  get engine() {
    return this.node.engine
  }

  update() {
    const mode = this.node.isSelected ? 'selected' : 'hover'

    this.clear()
    this.position.set(this.node.globalCenter.x, this.node.globalCenter.y)
    this.pivot.set(this.node.displayWidth / 2, this.node.displayHeight / 2)

    this.rect(0, 0, this.node.displayWidth, this.node.displayHeight).stroke({
      color: primaryColor,
      width: mode === 'selected' ? outlineWidth : outlineWidth2,
    })

    this.rotation = this.node.globalRotation
    if (this.parent == null) {
      this.node.engine.outlineLayer?.addChild(this)
    }
    this.show()
  }

  show() {
    this.engine.events.on('zoom:change', this.handleZoomChange)
    this.visible = true
  }

  hide() {
    this.engine.events.off('zoom:change', this.handleZoomChange)
    this.visible = false
  }

  destroy() {
    this.parent.removeChild(this)
    super.destroy()
  }

  handleZoomChange = () => {
    if (this.visible) {
      this.update()
    }
  }
}
