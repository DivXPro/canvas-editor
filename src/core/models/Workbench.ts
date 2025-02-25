import { computed, makeObservable, observable } from 'mobx'

import { DNode, DFrame, DRectangle, DText, IDFrameBase, IDRectangleBase, IDTextBase } from '../nodes'
import { NodeBase, Position, Size } from '../nodes/type'
import { DGroup, IDGroupBase } from '../nodes/DGroup'
import { isArr } from '../utils/types'
import { ControlBox } from '../components/ControlBox'
import { ZoomChangeEvent } from '../events/view/ZoomChangeEvent'

import { Engine, ICanva } from './Engine'
import { Selection } from './Selection'
import { Hover } from './Hover'
import { TransformHelper } from './TransformHelper'
import { History } from './History'
import { BackgroundLayer } from '../components/BackgroundLayer'
import { SelectionAreaLayer } from '../components/SelectionAreaLayer'
import { OutlineLayer } from '../components/OutlineLayer'

const DefaultFrame: IDFrameBase = {
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
  zoomRatio?: number
  enableZoom?: boolean
  minZoom?: number
  maxZoom?: number
  canvasSize?: Size
}

export class Workbench {
  id?: string

  title?: string

  description?: string

  engine: Engine

  outlineLayer?: OutlineLayer
  backgroundLayer?: BackgroundLayer
  selectionAreaLayer?: SelectionAreaLayer
  controlBox?: ControlBox

  canvasSize?: Size

  canvaNodes = observable.array<DNode>([])

  selection: Selection

  hover: Hover

  transformHelper: TransformHelper

  history: History

  enableZoom = false

  zoomRatio: number = 1

  maxZoom = 2

  minZoom = 0.5

  constructor(engine: Engine, options?: IWorkbench) {
    this.engine = engine
    this.enableZoom = options?.enableZoom ?? this.enableZoom
    this.zoomRatio = options?.zoomRatio ?? this.zoomRatio
    this.minZoom = options?.minZoom ?? this.minZoom
    this.maxZoom = options?.maxZoom ?? this.maxZoom
    this.canvasSize = options?.canvasSize

    this.hover = new Hover({
      engine: this.engine,
      operation: this,
    })
    this.selection = new Selection({
      engine: this.engine,
      workbench: this,
    })
    this.transformHelper = new TransformHelper({
      engine: this.engine,
      operation: this,
    })
    this.history = new History()
    makeObservable(this, {
      id: observable,
      title: observable,
      description: observable,
      canvaNodes: observable,
      zoomRatio: observable,
      enableZoom: observable,
      minZoom: observable,
      maxZoom: observable,
      selectableNodes: computed,
      history: observable.shallow,
    })

    if (this.enableZoom) {
      this.activeWheelZoom()
    }
  }

  initGuideLayers(background?: number) {
    this.backgroundLayer = new BackgroundLayer({ app: this.engine, color: background })
    this.selectionAreaLayer = new SelectionAreaLayer(this.engine)
    this.outlineLayer = new OutlineLayer(this.engine)
    this.controlBox = new ControlBox(this.engine)

    this.engine.app.stage.addChild(this.backgroundLayer)
    this.engine.app.stage.addChild(this.selectionAreaLayer)
    this.engine.app.stage.addChild(this.outlineLayer)
    this.engine.app.stage.addChild(this.controlBox)
  }

  init(props: IWorkbench) {
    const { canva } = props

    this.id = canva?.id
    this.title = canva?.title
    this.description = canva?.description
    this.canvasSize = props.canvasSize ?? this.canvasSize
    this.enableZoom = props.enableZoom ?? this.enableZoom
    this.zoomRatio = props.zoomRatio ?? this.zoomRatio
    this.minZoom = props.minZoom ?? this.minZoom
    this.maxZoom = props.maxZoom ?? this.maxZoom

    if (isArr(canva?.nodes)) {
      canva.nodes.forEach((node, index) => {
        if (node.type === 'FRAME') {
          const offset = {
            x: (this.canvasSize?.width ?? 0) / 2,
            y: (this.canvasSize?.height ?? 0) / 2,
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

  findById(id: string): DNode | undefined {
    for (const node of this.canvaNodes) {
      const found = node.findById(id)

      if (found) {
        return found
      }
    }
  }

  activeWheelZoom() {
    if (this.enableZoom) {
      this.engine.events.on('wheel', this.applyZoom.bind(this))
    }
  }

  applyZoom(event: WheelEvent) {
    const delta = event.deltaY
    let zoomRatio = this.zoomRatio ?? 1

    if (delta > 0) {
      zoomRatio -= 0.02
    } else {
      zoomRatio += 0.02
    }

    if (zoomRatio <= this.minZoom) {
      zoomRatio = this.minZoom
    } else if (zoomRatio >= this.maxZoom) {
      zoomRatio = this.maxZoom
    }

    this.zoomRatio = zoomRatio
    this.canvaNodes.forEach(node => node.setScale(this.zoomRatio))

    this.hover.clear()
    this.engine.events.emit('zoom:change', new ZoomChangeEvent({ zoomRatio }))
    event.preventDefault()
    event.stopPropagation()
  }

  serialize(): IWorkbench {
    return {
      canva: {
        id: this.id,
        title: this.title,
        description: this.description,
        nodes: this.canvaNodes.map(node => node.serialize()),
      },
      zoomRatio: this.zoomRatio,
      enableZoom: this.enableZoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
    }
  }

  get selectableNodes() {
    const topNodesOnCanvas = this.canvaNodes.filter(node => node.type !== 'FRAME')
    const topNodesInFrame = this.canvaNodes.filter(node => node.type === 'FRAME').map(node => node.children ?? [])

    return [...topNodesOnCanvas, ...topNodesInFrame.flat()]
  }

  generateElement(node: NodeBase, parentId?: string, offset?: Position): DNode | undefined {
    const { position, ...nodeProps } = node

    position.x += offset?.x ?? 0
    position.y += offset?.y ?? 0

    switch (nodeProps.type) {
      case 'FRAME':
        return new DFrame(this.engine, { ...(nodeProps as Omit<IDFrameBase, 'position'>), position })
      case 'GROUP':
        return new DGroup(this.engine, {
          ...(nodeProps as Omit<IDGroupBase, 'position'>),
          parentId,
          position,
        })
      case 'RECTANGLE':
        return new DRectangle(this.engine, {
          ...(nodeProps as Omit<IDRectangleBase, 'position'>),
          parentId,
          position,
        })
      case 'TEXT':
        return new DText(this.engine, { ...(nodeProps as Omit<IDTextBase, 'position'>), parentId, position })
      default:
        break
    }
  }
}
