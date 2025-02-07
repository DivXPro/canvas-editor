import { Graphics } from 'pixi.js'

import { DElement, IDElementInstance } from '../elements/DElement'
import { Engine } from '../Engine'
import { HoverElementEvent } from '../events'
import { outlineWidth } from '../config'

export interface IOutline {
  update: (element: IDElementInstance<any>) => void
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
      if (event.data.source instanceof DElement) {
        this.update(event.data.source)
      } else {
        this.hide()
      }
    })
  }

  update(element: IDElementInstance<any>) {
    if (element.displayWidth && element.displayHeight) {
      this.position.set(element.globalCenter.x, element.globalCenter.y)
      this.clear()
        .rect(0, 0, element.displayWidth, element.displayHeight)
        .stroke({ color: 0x238def, width: outlineWidth })
      this.pivot.set(element.displayWidth / 2, element.displayHeight / 2)
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
    console.log('show outline')
    this.visible = true
  }

  hide() {
    this.visible = false
  }
}
