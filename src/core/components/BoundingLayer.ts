import { Container } from 'pixi.js'

import { Engine } from '../Engine'
import { DNode } from '../elements'

import { BoundingBox } from './BoundingBox'

export class BoundingLayer extends Container {
  engine: Engine
  declare children: BoundingBox[]
  constructor(engine: Engine) {
    super()
    this.engine = engine
  }

  addBoundingBox(element: DNode) {
    return this.addChild(new BoundingBox(element))
  }

  removeBoundingBox(box: BoundingBox) {
    this.removeChild(box)
  }

  update() {
    this.children.filter(boundingBox => boundingBox.visible).forEach(boundingBox => boundingBox.update())
  }
}
