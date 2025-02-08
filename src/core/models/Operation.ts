import { Engine } from '../Engine'
import { DNode, DFrame, DRectangle, DText, IDFrameBase, IDRectangleBase, IDTextBase } from '../elements'
import { FrameBase, NodeBase } from '../elements/type'

import { Selection } from './Selection'
import { Hover } from './Hover'

declare type DefaultFrameType = Omit<IDFrameBase, 'engine' | 'parent'>

const DefaultFrame: DefaultFrameType = {
  id: 'rootFrame',
  name: 'Frame',
  position: { x: 0, y: 0 },
  size: {
    width: 512,
    height: 512,
  },
  type: 'FRAME',
  backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
}

export interface IOperation {
  frame?: FrameBase
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

  init(frame: IDFrameBase | DefaultFrameType = DefaultFrame) {
    this.frame = new DFrame({
      engine: this.engine,
      id: frame.id,
      name: frame.name,
      position: frame.position,
      size: frame.size,
      rotation: frame.rotation,
      children: frame.children,
      type: 'FRAME',
      backgroundColor: frame.backgroundColor,
    })
    this.engine.app.stage.addChildAt(this.frame.item, 1)
  }

  serialize(): IOperation {
    return {
      frame: this.frame?.jsonData,
    }
  }

  generateElement(item: NodeBase, parent?: DNode): DNode | undefined {
    switch (item.type) {
      case 'FRAME':
        return new DFrame({ engine: this.engine, ...(item as IDFrameBase) })
      // case 'GROUP':
      //   return new DFrameBase({
      //     engine: this.engine,
      //     parent,
      //     ...(item as IDFrameBase),
      //   })
      case 'RECTANGLE':
        return new DRectangle({ engine: this.engine, parent, ...(item as IDRectangleBase) })
      case 'TEXT':
        return new DText({ engine: this.engine, parent, ...(item as IDTextBase) })
      default:
        break
    }
  }
}
