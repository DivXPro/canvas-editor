import { computed, makeObservable, observable } from 'mobx'

import { DNode, DFrame, DRectangle, DText, IDFrameBase, IDRectangleBase, IDTextBase, DFrameBase } from '../nodes'
import { NodeBase, Position } from '../nodes/type'
import { DGroup, IDGroupBase } from '../nodes/DGroup'
import { isArr } from '../utils/types'

import { Engine, ICanva } from './Engine'
import { Selection } from './Selection'
import { Hover } from './Hover'
import { TransformHelper } from './TransformHelper'
import { History } from './History'

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

export interface IWorkbench {
  canva?: ICanva
}

export class Workbench {
  id?: string

  title?: string

  description?: string

  engine: Engine

  canvaNodes = observable.array<DNode>([])

  selection: Selection

  hover: Hover

  transformHelper: TransformHelper

  history: History

  zoomRatio: number = 1

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
    this.transformHelper = new TransformHelper({
      engine: this.engine,
      operation: this,
    })
    this.history = new History()
    makeObservable(this, {
      canvaNodes: observable,
      zoomRatio: observable,
      selectableNodes: computed,
      history: observable.shallow,
    })
  }

  init(props: ICanva) {
    this.id = props.id
    this.title = props.title
    this.description = props.description

    if (isArr(props.nodes)) {
      props.nodes.forEach((node, index) => {
        if (node.type === 'FRAME') {
          const offset = {
            x: (this.engine.canvasSize?.width ?? 0) / 2,
            y: (this.engine.canvasSize?.height ?? 0) / 2,
          }

          const dNode = this.generateElement(node, undefined, offset)

          if (dNode != null) {
            this.canvaNodes.push(dNode)
            if (dNode.item != null) {
              this.engine.app.stage.addChildAt(dNode.item, index + 1)
            }
          }
        }
      })
    }
  }

  findById(id: string) {
    for (const node of this.canvaNodes) {
      const found = node.findById(id)

      if (found) {
        return found
      }
    }
  }

  setZoom(zoomRatio: number) {
    this.zoomRatio = zoomRatio
    this.canvaNodes.forEach(node => node.setScale(this.zoomRatio))
  }

  serialize(): IWorkbench {
    return {
      canva: {
        id: this.id,
        title: this.title,
        description: this.description,
        nodes: this.canvaNodes.map(node => node.serialize()),
      },
    }
  }

  get selectableNodes() {
    const topNodesOnCanvas = this.canvaNodes.filter(node => node.type !== 'FRAME')
    const topNodesInFrame = this.canvaNodes.filter(node => node.type === 'FRAME').map(node => node.children ?? [])

    return [...topNodesOnCanvas, ...topNodesInFrame.flat()]
  }

  generateElement(node: NodeBase, parent?: DFrameBase, offset?: Position): DNode | undefined {
    const { position, ...nodeProps } = node

    position.x += offset?.x ?? 0
    position.y += offset?.y ?? 0

    switch (nodeProps.type) {
      case 'FRAME':
        return new DFrame({ engine: this.engine, position, ...(nodeProps as Omit<IDFrameBase, 'position'>) })
      case 'GROUP':
        return new DGroup({
          engine: this.engine,
          parent,
          position,
          ...(nodeProps as Omit<IDGroupBase, 'position'>),
        })
      case 'RECTANGLE':
        return new DRectangle({
          engine: this.engine,
          parent,
          position,
          ...(nodeProps as Omit<IDRectangleBase, 'position'>),
        })
      case 'TEXT':
        return new DText({ engine: this.engine, parent, position, ...(nodeProps as Omit<IDTextBase, 'position'>) })
      default:
        break
    }
  }
}
