import { Graphics } from 'pixi.js'

import { IDElementInstance } from './elements/DElement'

export interface IOutline {
  element: IDElementInstance<any>
  update: (element: IDElementInstance<any>) => void
  show: () => void
  hide: () => void
}

export class Outline extends Graphics implements IOutline {
  element: IDElementInstance<any>
  constructor(element: IDElementInstance<any>) {
    super({
      x: element.centerX,
      y: element.centerY,
    })
    this.element = element
    this.visible = false
    this.update()
  }

  update(element: IDElementInstance<any> = this.element) {
    if (element.width && element.height) {
      this.position.set(element.centerX, element.centerY)
      this.clear().rect(0, 0, element.width, element.height).stroke({ color: 0x238def, width: 2 })
      this.pivot.set(element.width / 2, element.height / 2)
      this.rotation = element.rotation ?? 0
      if (this.parent == null) {
        this.element.app.outlineLayer?.addChild(this)
      }
    } else {
      this.clear()
    }
  }

  show() {
    this.update()
    this.visible = true
  }

  hide() {
    this.visible = false
  }
}
