import { Container } from 'pixi.js'

import { BoundingBox } from './BoundingBox'

export class BoundingLayer extends Container {
  declare children: BoundingBox[]
  constructor() {
    super()
  }
}
