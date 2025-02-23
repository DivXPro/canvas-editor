import { customAlphabet } from 'nanoid'
import { Container, EventMode, Matrix, Point } from 'pixi.js'
import { action, computed, makeObservable, observable } from 'mobx'

import { Engine } from '../models/Engine'
import { Outline } from '../components/Outline'

import { BlendMode, Effect, NodeBase, NodeType, Paint, Rect, Position, ResizeHandle, Size } from './type'
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
  position: Position
  displayWidth: number
  displayHeight: number
  item?: Item
  globalPosition: Position
  globalCenter: Position
  absoluteBoundingBox: Rect
  absVertices: Position[]
  serialize: () => NodeBase
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
  static GetNodeCenter(position: Position, r: number, rotation: number) {
    return {
      x: position.x + Math.cos(Math.PI / 4 + rotation) * r,
      y: position.y + Math.sin(Math.PI / 4 + rotation) * r,
    }
  }

  static GetNodeR(size: Size) {
    return Math.sqrt(Math.pow(size?.width ?? 0, 2) + Math.pow(size?.height ?? 0, 2)) / 2
  }

  _locked?: boolean
  _visible: boolean = true
  _rotation?: number
  _position: Position
  _size: Size

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
    this._size = options.size ?? { width: 0, height: 0 }
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
      _size: observable,
      _position: observable,
      _locked: observable,
      _visible: observable,
      _rotation: observable,
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
      absVertices: computed,
      displayWidth: computed,
      displayHeight: computed,
      serialize: action.bound,
      setHidden: action.bound,
      setLocked: action.bound,
      setPosition: action.bound,
      setRotation: action.bound,
      setScale: action.bound,
      setSize: action.bound,
    })
    this.outline = this.engine.outlineLayer?.addOutline(this)
  }
  visable?: boolean | undefined

  abstract update(): void

  get index() {
    return this.parent?.children?.indexOf(this) ?? 0
  }

  get position() {
    return this._position
  }

  set position(value: Position) {
    this.setPosition(value.x, value.y)
  }

  get size(): Size {
    return this._size
  }

  set size(size: Size) {
    this.setSize(size)
  }

  setSize(size: Size) {
    this._size = size
  }

  get r() {
    return this.size != null ? DNode.GetNodeR(this.size) : 0
  }

  get center() {
    return this.position
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

  get absVertices(): Position[] {
    const rect: Position[] = [
      {
        x: this.globalPosition.x - ((this.size?.width ?? 0) / 2) * this.engine.zoomRatio,
        y: this.globalPosition.y - ((this.size?.height ?? 0) / 2) * this.engine.zoomRatio,
      },
      {
        x: this.globalPosition.x + ((this.size?.width ?? 0) / 2) * this.engine.zoomRatio,
        y: this.globalPosition.y - ((this.size?.height ?? 0) / 2) * this.engine.zoomRatio,
      },
      {
        x: this.globalPosition.x + ((this.size?.width ?? 0) / 2) * this.engine.zoomRatio,
        y: this.globalPosition.y + ((this.size?.height ?? 0) / 2) * this.engine.zoomRatio,
      },
      {
        x: this.globalPosition.x - ((this.size?.width ?? 0) / 2) * this.engine.zoomRatio,
        y: this.globalPosition.y + ((this.size?.height ?? 0) / 2) * this.engine.zoomRatio,
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
    return this.engine.workbench
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

  setScale(scaleX: number, scaleY?: number) {
    if (this.item) {
      this.item.scale.set(scaleX, scaleY)
    }
  }

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

  containsPoint(point: Position) {
    return false
  }

  serialize(): NodeBase {
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

  moveTo(point: Position) {
    this.setPosition(point.x, point.y)
  }

  destory() {
    this.item?.destroy()
    this.outline?.destroy()
  }

  resize(handle: ResizeHandle, size: Size) {
    const oldSize = this.size
    const oldPosition = this.position
    const rotation = this.rotation

    // 计算尺寸变化
    const dx = (size.width - oldSize.width) / 2
    const dy = (size.height - oldSize.height) / 2

    // 考虑旋转角度计算实际偏移
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)

    // 根据不同的控制点计算偏移
    let offsetX = 0
    let offsetY = 0

    switch (handle) {
      case ResizeHandle.Top:
      case ResizeHandle.Bottom:
        offsetX = dy * sin
        offsetY = -dy * cos
        break
      case ResizeHandle.Left:
      case ResizeHandle.Right:
        offsetX = -dx * cos
        offsetY = -dx * sin
        break
      case ResizeHandle.TopLeft:
      case ResizeHandle.BottomRight:
        offsetX = -(dx * cos - dy * sin)
        offsetY = -(dx * sin + dy * cos)
        break
      case ResizeHandle.TopRight:
      case ResizeHandle.BottomLeft:
        offsetX = dx * cos + dy * sin
        offsetY = dx * sin - dy * cos
        break
      default:
        break
    }

    // 根据控制点方向调整位置
    switch (handle) {
      case ResizeHandle.Top:
      case ResizeHandle.TopLeft:
      case ResizeHandle.TopRight:
        this.setPosition(oldPosition.x + offsetX, oldPosition.y + offsetY)
        break
      case ResizeHandle.Bottom:
      case ResizeHandle.BottomLeft:
      case ResizeHandle.BottomRight:
        this.setPosition(oldPosition.x - offsetX, oldPosition.y - offsetY)
        break
      case ResizeHandle.Left:
        this.setPosition(oldPosition.x + offsetX, oldPosition.y + offsetY)
        break
      case ResizeHandle.Right:
        this.setPosition(oldPosition.x - offsetX, oldPosition.y - offsetY)
        break
    }

    this.setSize(size)
  }
}

export function eid(): string {
  const nanoid = customAlphabet('1234567890abcdef', 16)

  return nanoid()
}
