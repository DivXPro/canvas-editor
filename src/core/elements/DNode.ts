import { customAlphabet } from 'nanoid'
import { Container, EventMode, FederatedPointerEvent, Size } from 'pixi.js'
import { action, computed, makeObservable, observable } from 'mobx'

import { Engine } from '../Engine'
import { BoundingBox } from '../components/BoundingBox'
import { Outline } from '../components/Outline'

import { BlendMode, Effect, NodeBase, NodeType, Paint, Rect, Vector2 } from './type'
import { DragElementEvent } from '../events/mutation/DragElementEvent'
import { DragMoveEvent, DragStartEvent } from '../events'

export interface ScaleData {
  x: number
  y: number
}

export interface INodeBase extends NodeBase {
  locked?: boolean
  index?: number
}

export interface IDNode<Item extends Container> extends INodeBase {
  position: Vector2
  displayWidth: number
  displayHeight: number
  item?: Item
  globalPosition: Vector2
  globalCenter: Vector2
  absoluteBoundingBox: Rect
  jsonData: NodeBase
  isSelected?: boolean
  isHovered?: boolean
  isDragging?: boolean
  eventMode?: EventMode
}

export interface DNodeOptions extends INodeBase {
  engine: Engine
  parent?: DNode
}

export abstract class DNode implements IDNode<any> {
  protected dragStartPosition?: { x: number; y: number }
  protected elementStartPosition?: { x: number; y: number }
  protected _locked?: boolean
  protected _visible: boolean = true
  protected _rotation?: number
  protected _position: Vector2
  protected _size?: Size

  engine: Engine
  parent?: DNode
  root?: DNode

  id: string
  name: string
  type: NodeType
  blendMode: BlendMode = 'NORMAL'
  fills = observable.array<Paint>([])
  strokes = observable.array<Paint>([])
  strokeWeight: number = 1
  strokeAlign: 'INSIDE' | 'OUTSIDE' | 'CENTER' = 'CENTER'
  effects = observable.array<Effect>([])
  isMask?: boolean | undefined
  children?: DNode[]
  isDragging?: boolean
  isHovered?: boolean | undefined
  pluginData?: any
  sharedPluginData?: any

  item?: Container
  boundingBox?: BoundingBox
  outline?: Outline

  constructor(options: DNodeOptions) {
    this.engine = options.engine
    this.parent = options.parent
    this.root = options.parent?.root

    this.id = options.id ?? eid()
    this.name = options.name
    this.type = options.type
    this.blendMode = options.blendMode ?? 'NORMAL'
    this.strokeAlign = options.strokeAlign ?? 'CENTER'
    this.strokeWeight = options.strokeWeight ?? 1
    this.isMask = options.isMask ?? false
    if (options.strokes) {
      options.strokes.forEach(paint => {
        this.strokes.push(paint)
      })
    }
    if (options.fills) {
      options.fills.forEach(paint => {
        this.fills.push(paint)
      })
    }
    if (options.effects) {
      options.effects.forEach(effect => {
        this.effects.push(effect)
      })
    }

    this._position = options.position ?? { x: 0, y: 0 }
    this._size = options.size
    this._locked = options.locked ?? false
    this._visible = options.visible ?? true
    this._rotation = options.rotation

    makeObservable(this, {
      id: observable,
      name: observable,
      type: observable,
      blendMode: observable,
      fills: observable,
      strokes: observable,
      strokeAlign: observable,
      strokeWeight: observable,
      effects: observable,
      isMask: observable,
      isDragging: observable,
      rotation: computed,
      index: computed,
      absoluteBoundingBox: computed,
      visible: computed,
      locked: computed,
      isSelected: computed,
      position: computed,
      size: computed,
      globalCenter: computed,
      globalPosition: computed,
      jsonData: computed,
      setHidden: action.bound,
      setLocked: action.bound,
      setPostion: action.bound,
      setRotation: action.bound,
    })
    this.outline = this.engine.outlineLayer?.addOutline(this)
    this.boundingBox = this.engine.boundingLayer?.addBoundingBox(this)
  }
  visable?: boolean | undefined

  get index() {
    return this.parent?.children?.indexOf(this) ?? 0
  }

  get position() {
    return this._position
  }

  set postion(value: Vector2) {
    this.setPostion(value.x, value.y)
  }

  get size() {
    return this._size
  }

  get rotation(): number {
    return this._rotation ?? 0
  }

  set rotation(value: number) {
    this.setRotation(value)
  }

  setRotation(rotation: number) {
    this._rotation = rotation
    if (this.item) {
      this.item.rotation = rotation
    }
  }

  get locked() {
    return this._locked ?? false
  }

  set locked(locked: boolean) {
    this.setLocked(locked)
  }

  setLocked(locked: boolean) {
    this._locked = locked
    this.eventMode = this._locked ? 'none' : 'dynamic'
  }

  get visible() {
    return this._visible ?? false
  }

  set visible(value: boolean) {
    this.setHidden(value)
  }

  setHidden(value: boolean) {
    this._visible = value
    if (this.item) {
      this.item.visible = !value
    }
  }

  get isSelected() {
    return this.operation?.selection.has(this) ?? false
  }

  get displayWidth() {
    if (this.item) {
      return this.item.width * this.engine.zoomRatio
    }

    return 0
  }

  get displayHeight() {
    if (this.item) {
      return this.item.height * this.engine.zoomRatio
    }

    return 0
  }

  get globalPosition() {
    return this.item?.getGlobalPosition() ?? { x: 0, y: 0 }
  }

  get globalCenter() {
    return this.globalPosition
  }

  get absoluteBoundingBox() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  }

  setPostion(x: number, y: number) {
    this._position = { x, y }
    this.item?.position.set(x, y)
  }

  get operation() {
    return this.engine.operation
  }

  get eventMode() {
    return this.item?.eventMode ?? 'none'
  }

  set eventMode(mode: EventMode) {
    if (this.item) {
      this.item.eventMode = mode
    }
  }

  protected initInteractive() {
    if (this.item) {
      this.item.on('pointerenter', this.handlePointerEnter.bind(this))
      this.item.on('pointerleave', this.handlePointerLeave.bind(this))
      this.item.on('pointerdown', this.handlePointerDown.bind(this))
      // this.item.on('pointerup', this.handlePointerUp.bind(this))
      // this.item.on('pointermove', this.handlePointerMove.bind(this))
      // this.item.on('pointertap', this.handlePointerTap.bind(this))
      this.eventMode = this.locked ? 'none' : 'dynamic'
    }
  }

  protected handlePointerEnter(event: FederatedPointerEvent) {
    this.operation?.hover.setHover(this)
  }

  protected handlePointerLeave(event: FederatedPointerEvent) {
    this.operation?.hover.setHover()
  }

  protected handlePointerDown(event: FederatedPointerEvent) {
    this.operation?.selection.safeSelect(this)
    this.operation?.dragMove.dragStart(event)
    event.stopPropagation()
  }

  protected handlePointerMove(event: FederatedPointerEvent) {
    if (this.operation?.dragMove.dragging) {
      this.operation?.dragMove.dragMove(event)
    }
    event.stopPropagation()
  }

  protected handlePointerUp(event: FederatedPointerEvent) {
    if (this.operation?.dragMove.dragging) {
      this.operation?.dragMove.dragStop(event)
    }
    event.stopPropagation()
  }

  // protected handlePointerTap(event: FederatedPointerEvent) {
  //   this.operation?.selection.safeSelect(this)
  //   event.stopPropagation()
  //   event.preventDefault()
  // }

  findById(id: string): DNode | undefined {
    if (this.id === id) {
      return this
    }
    if (this.children) {
      for (const child of this.children) {
        const found = child.findById(id)

        if (found) {
          return found
        }
      }
    }
  }

  get jsonData(): NodeBase {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      blendMode: this.blendMode,
      position: this.position,
      size: this.size,
      rotation: this.rotation,
      locked: this.locked,
      visible: this.visible,
      absoluteBoundingBox: this.absoluteBoundingBox,
      fills: this.fills.slice(), // 添加 fills 属性
      strokes: this.strokes.slice(), // 添加 strokes 属性
      strokeWeight: this.strokeWeight, // 添加 strokeWeight 属性
      strokeAlign: this.strokeAlign, // 添加 strokeAlign 属性
      effects: this.effects.slice(), // 添加 effects 属性
    }
  }

  moveTo(point: Vector2) {
    this.setPostion(point.x, point.y)
  }

  destory() {
    this.item?.destroy()
    this.outline?.destroy()
    this.boundingBox?.destroy()
  }
}

export function eid(): string {
  const nanoid = customAlphabet('1234567890abcdef', 16)

  return nanoid()
}
