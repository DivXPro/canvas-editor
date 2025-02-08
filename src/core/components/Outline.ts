import { Graphics } from 'pixi.js'

import { DNode } from '../elements/DNode'
import { Engine } from '../Engine'
import { HoverElementEvent } from '../events'
import { outlineWidth } from '../config'

export interface IOutline {
  update: (element: DNode) => void
  show: () => void
  hide: () => void
}

export class Outline extends Graphics implements IOutline {
  engine: Engine
  constructor(engine: Engine) {
    super({
      x: 0,
      y: 0,
    })
    this.engine = engine
    this.visible = false

    this.engine.events.on('element:hover', (event: HoverElementEvent) => {
      if (event.data.source instanceof DNode) {
        this.update(event.data.source)
      } else {
        this.hide()
      }
    })
  }

  update(element: DNode) {
    if (element.displayWidth && element.displayHeight) {
      console.log('outline element', element.absoluteBoundingBox)
      this.position.set(element.globalCenter.x, element.globalCenter.y)
      this.clear()
        .rect(-element.displayWidth / 2, -element.displayHeight / 2, element.displayWidth, element.displayHeight)
        .stroke({ color: 0x238def, width: outlineWidth })
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
}
