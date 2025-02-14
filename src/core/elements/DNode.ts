import { customAlphabet } from 'nanoid'
import { Container, EventMode, FederatedPointerEvent, Matrix, Point, Size } from 'pixi.js'
import { action, computed, makeObservable, observable } from 'mobx'

import { Engine } from '../Engine'
import { BoundingBox } from '../components/BoundingBox'
import { Outline } from '../components/Outline'

import { BlendMode, Effect, NodeBase, NodeType, Paint, Rect, Vector2 } from './type'
import { DFrameBase } from './DFrameBase'

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
  absRectPoints: Vector2[]
  jsonData: NodeBase
  isSelected?: boolean
  isHovered?: boolean
  isDragging?: boolean
  eventMode?: EventMode
}

export interface DNodeOptions extends INodeBase {
  engine: Engine
  parent?: DFrameBase
}

export abstract class DNode implements IDNode<any> {
  static GetNodeCenter(position: Vector2, r: number, rotation: number) {
    return {
      x: position.x + Math.cos(Math.PI / 4 + rotation) * r,
      y: position.y + Math.sin(Math.PI / 4 + rotation) * r,
    }
  }

  static GetNodeR(size: Size) {
    return Math.sqrt(Math.pow(size?.width ?? 0, 2) + Math.pow(size?.height ?? 0, 2)) / 2
  }

  protected dragStartPosition?: { x: number; y: number }
  protected elementStartPosition?: { x: number; y: number }
  protected _locked?: boolean
  protected _visible: boolean = true
  protected _rotation?: number
  protected _position: Vector2
  protected _size?: Size

  engine: Engine
  parent?: DFrameBase
  root?: DFrameBase

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
    this._size = options.size ?? this._size
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
      globalRotation: computed,
      absRectPoints: computed,
      displayWidth: computed,
      displayHeight: computed,
      jsonData: computed,
      setHidden: action.bound,
      setLocked: action.bound,
      setPosition: action.bound,
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

  set position(value: Vector2) {
    this.setPosition(value.x, value.y)
  }

  get size() {
    return this._size
  }

  get r() {
    return this.size != null ? DNode.GetNodeR(this.size) : 0
  }

  get center() {
    return this.position
    // return DNode.GetNodeCenter(this.position, this.r, this.rotation)
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
      this.item.rotation = this._rotation
    }
  }

  get globalRotation(): number {
    return this.rotation + (this.parent?.globalRotation ?? 0)
  }

  get absRectPoints() {
    const rect = [
      {
        x: this.globalPosition.x - (this.size?.width ?? 0) / 2,
        y: this.globalPosition.y - (this.size?.height ?? 0) / 2,
      },
      {
        x: this.globalPosition.x + (this.size?.width ?? 0) / 2,
        y: this.globalPosition.y - (this.size?.height ?? 0) / 2,
      },
      {
        x: this.globalPosition.x + (this.size?.width ?? 0) / 2,
        y: this.globalPosition.y + (this.size?.height ?? 0) / 2,
      },
      {
        x: this.globalPosition.x - (this.size?.width ?? 0) / 2,
        y: this.globalPosition.y + (this.size?.height ?? 0) / 2,
      },
    ]

    const mt = new Matrix()

    mt.translate(-this.globalPosition.x, -this.globalPosition.y)
    mt.rotate(this.globalRotation)
    mt.translate(this.globalPosition.x, this.globalPosition.y)

    return rect.map(p => mt.apply({ x: p.x, y: p.y }))
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
    return (this.size?.width ?? 0) * this.engine.zoomRatio
  }

  get displayHeight() {
    return (this.size?.height ?? 0) * this.engine.zoomRatio
  }

  get globalPosition() {
    return this.item?.getGlobalPosition() ?? { x: 0, y: 0 }
  }

  get globalCenter() {
    return this.item?.getGlobalPosition(new Point(this.center.x, this.center.y)) ?? { x: 0, y: 0 }
  }

  get absoluteBoundingBox() {
    if (this.item == null) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    }
    const bounds = this.item.getLocalBounds()

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.width,
      height: bounds.height,
    }
  }

  setPosition(x: number, y: number) {
    this._position = { x, y }
    if (this.root) {
      const pos = this.root.tansformRoot2Local({ x, y })

      this.item?.position.set(pos.x, pos.y)
    } else {
      this.item?.position.set(x, y)
    }
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

  get topGroup(): DFrameBase | undefined {
    if (this.parent == null || this.parent === this.root) {
      return
    }
    if (this.parent.parent === this.root) {
      return this.parent
    }

    return this.parent.topGroup
  }

  protected initInteractive() {
    if (this.item) {
      this.item.on('pointerenter', this.handlePointerEnter.bind(this))
      this.item.on('pointerleave', this.handlePointerLeave.bind(this))
      this.item.on('pointerdown', this.handlePointerDown.bind(this))
      this.eventMode = this.locked ? 'none' : 'dynamic'
    }
  }

  protected handlePointerEnter(event: FederatedPointerEvent) {
    if (this.locked) {
      return
    }
    if (this.parent === this.root) {
      this.operation?.hover.setHover(this)
      event.preventDefault()
      event.stopPropagation()
    } else {
      this.operation?.hover.setHover(this.topGroup)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  protected handlePointerLeave(event: FederatedPointerEvent) {
    if (this.locked) {
      return
    }
    if (this.parent === this.root) {
      this.operation?.hover.setHover()
    }
    this.operation?.hover.setHover()
  }

  protected handlePointerDown(event: FederatedPointerEvent) {
    if (this.locked) {
      return
    }
    if (this.parent === this.root) {
      this.operation?.selection.safeSelect(this)
      this.operation?.dragMove.dragStart(event)
      event.preventDefault()
      event.stopPropagation()
    } else if (this.topGroup) {
      this.operation?.selection.safeSelect(this.topGroup)
      this.operation?.dragMove.dragStart(event)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  // protected handlePointerMove(event: FederatedPointerEvent) {
  //   if (this.operation?.dragMove.dragging) {
  //     this.operation?.dragMove.dragMove(event)
  //   }
  //   event.stopPropagation()
  // }

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

  addTo(parent: DFrameBase) {
    parent.children?.push(this)
    if (this.item && parent.item) {
      const position = parent.item.toLocal(this.globalPosition)

      this.item?.position.set(position.x, position.y)
    }
  }

  moveTo(point: Vector2) {
    this.setPosition(point.x, point.y)
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
