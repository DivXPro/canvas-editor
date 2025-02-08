import { Container } from 'pixi.js'
import { makeObservable, override } from 'mobx'

import { Frame } from '../components/Frame'

import { DFrameBase, DFrameBaseOptions, IDFrameBaseBase } from './DFrameBase'

export interface DGroupOptions extends DFrameBaseOptions { }

export interface IDGroupBase extends IDFrameBaseBase { }

export class DGroup extends DFrameBase {
  declare item: Container

  constructor(options: DGroupOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      jsonData: override,
    })

    this.item = new Container({
      x: this.position.x,
      y: this.position.y,
      rotation: this.rotation,
    })
    this.init(options.children)
  }
}
