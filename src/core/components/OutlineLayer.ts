import { Container } from 'pixi.js'

import { Engine } from '../Engine'

import { Outline } from './Outline'

export class OutlineLayer extends Container {
  engine: Engine
  outline: Outline
  declare children: Outline[]

  constructor(engine: Engine) {
    super()
    this.engine = engine
    this.outline = new Outline(engine)
    this.addChildAt(this.outline, 0)
  }
}
