import { Container } from 'pixi.js'

import { Outline } from './Outline'

export class OutlineLayer extends Container {
  declare children: Outline[]
  constructor() {
    super()
  }
}
