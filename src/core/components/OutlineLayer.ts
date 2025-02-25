import { Container } from 'pixi.js'

import { Engine } from '../models'
import { DNode } from '../nodes'

import { Outline } from './Outline'

export class OutlineLayer extends Container {
  engine: Engine
  declare children: Outline[]

  constructor(engine: Engine) {
    super()
    this.engine = engine
  }

  addOutline(node: DNode) {
    return this.addChild(new Outline(node))
  }
}
