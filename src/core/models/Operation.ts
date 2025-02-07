import { Engine } from '../Engine'
import {
  DElement,
  DFrame,
  DGroup,
  DRectangle,
  DText,
  IDElement,
  IDFrame,
  IDGroup,
  IDRectangle,
  IDText,
} from '../elements'

import { Selection } from './Selection'
import { Hover } from './Hover'

const DefaultFrame: IDFrame = {
  width: 512,
  height: 512,
  type: 'Frame',
  x: 0,
  y: 0,
}

export interface IOperation {
  frame?: IDElement
  selected?: string[]
}

export class Operation {
  engine: Engine

  frame?: DFrame

  selection: Selection

  hover: Hover

  constructor(engine: Engine) {
    this.engine = engine
    this.hover = new Hover({
      engine: this.engine,
      operation: this,
    })
    this.selection = new Selection({
      engine: this.engine,
      operation: this,
    })
  }

  init(frame: IDFrame = DefaultFrame) {
    this.frame = new DFrame({
      engine: this.engine,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      rotation: frame.rotation,
      items: frame.items,
      type: 'Frame',
    })
    this.engine.app.stage.addChildAt(this.frame.item, 1)
  }

  serialize(): IOperation {
    return {
      frame: this.frame?.jsonData,
    }
  }

  generateElement(item: IDElement, parent?: DElement) {
    switch (item.type) {
      case 'Frame':
        return new DFrame({ engine: this.engine, ...(item as IDFrame) })
      case 'Group':
        return new DGroup({
          engine: this.engine,
          parent,
          ...(item as IDGroup),
        })
      case 'Rectangle':
        return new DRectangle({ engine: this.engine, parent, ...(item as IDRectangle) })
      case 'Text':
        return new DText({ engine: this.engine, parent, ...(item as IDText) })
      default:
        break
    }
  }
}
