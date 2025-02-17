import { makeObservable, observable } from 'mobx'

import { Engine } from '../Engine'
import { DNode, DFrame, DRectangle, DText, IDFrameBase, IDRectangleBase, IDTextBase, DFrameBase } from '../elements'
import { FrameBase, NodeBase } from '../elements/type'
import { DGroup, IDGroupBase } from '../elements/DGroup'

import { Selection } from './Selection'
import { Hover } from './Hover'
import { DragMove } from './DragMove'

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

  dragMove: DragMove

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
    this.dragMove = new DragMove({
      engine: this.engine,
      operation: this,
    })
    makeObservable(this, {
      frame: observable,
    })
  }

  init(frame: IDFrameBase | DefaultFrameType = DefaultFrame) {
    // const position = {
    //   x: frame.position.x + (this.engine.canvasSize?.width ?? 0) / 2 - frame.size.width / 2,
    //   y: frame.position.y + (this.engine.canvasSize?.height ?? 0) / 2 - frame.size.height / 2,
    // }

    const position = {
      x: frame.position.x + (this.engine.canvasSize?.width ?? 0) / 2,
      y: frame.position.y + (this.engine.canvasSize?.height ?? 0) / 2,
    }

    console.log('position', position)
    this.frame = new DFrame({
      engine: this.engine,
      id: frame.id,
      name: frame.name,
      position: position,
      size: frame.size,
      rotation: frame.rotation,
      children: frame.children,
      type: 'FRAME',
      backgroundColor: frame.backgroundColor,
    })
    this.engine.app.stage.addChildAt(this.frame.item, 1)
  }

  findById(id: string) {
    return this.frame?.findById(id)
  }

  serialize(): IOperation {
    return {
      frame: this.frame?.jsonData,
    }
  }

  generateElement(item: NodeBase, parent?: DFrameBase): DNode | undefined {
    switch (item.type) {
      case 'FRAME':
        return new DFrame({ engine: this.engine, ...(item as IDFrameBase) })
      case 'GROUP':
        return new DGroup({
          engine: this.engine,
          parent,
          ...(item as IDGroupBase),
        })
      case 'RECTANGLE':
        return new DRectangle({ engine: this.engine, parent, ...(item as IDRectangleBase) })
      case 'TEXT':
        return new DText({ engine: this.engine, parent, ...(item as IDTextBase) })
      default:
        break
    }
  }
}
