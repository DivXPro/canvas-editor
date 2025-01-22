import { Graphics } from 'pixi.js'

import { IDElementInstance } from './elements/DElement'

export class Outline extends Graphics {
  element: IDElementInstance<any>
  constructor(element: IDElementInstance<any>) {
    super({
      x: element.x,
      y: element.y,
    })
    this.element = element
    this.visible = false
    this.render()
  }

  render(element: IDElementInstance<any> = this.element) {
    // this.position.set(element.x + element.width / 2, element.y + element.height / 2)
    this.clear().rect(0, 0, element.width, element.height).stroke({ color: 0x238def, width: 2 })
    this.pivot.set(element.width / 2, element.height / 2)
    this.rotation = element.rotation ?? 0
    if (this.parent == null) {
      this.element.app.outlineLayer?.addChild(this)
    }
  }

  show() {
    console.log('show outline')
    this.render()
    // this.element.app.stage.setChildIndex(this, this.element.app.stage.children.length - 1)
    this.visible = true
  }

  hide() {
    console.log('hide outline')
    this.visible = false
  }
}
