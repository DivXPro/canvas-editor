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
      x: element.globalCenter.x,
      y: element.globalCenter.y,
    })

    this.element = element
    this.visible = false
    this.update()
  }

  update(element: IDElementInstance<any> = this.element) {
    if (element.width && element.height) {
      this.position.set(element.globalCenter.x, element.globalCenter.y)
      console.log('item', element.globalCenter.x, element.globalCenter.y, element.displayWidth, element.displayHeight, element.width, element.height)
      this.clear().rect(0, 0, element.displayWidth, element.displayHeight).stroke({ color: 0x238def, width: 2 })
      this.pivot.set(element.displayWidth / 2, element.displayHeight / 2)
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
