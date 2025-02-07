import { customAlphabet } from 'nanoid'
import { Container, EventMode, FederatedPointerEvent, PointData } from 'pixi.js'

import { Engine } from '../Engine'
import { Outline } from '../components/Outline'
import { BoundingBox } from '../components/BoundingBox'
import { HoverElementEvent, SelectElementEvent, UnselectElementEvent } from '../events/mutation/SelectElementEvent'

export interface IDElementBase {
  id?: string
  name?: string
  type: string
  index?: number
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  locked?: boolean
  hidden?: boolean
}

export interface IDElement extends IDElementBase {
  items?: IDElement[]
  [key: string]: any
}

export interface ScaleData {
  x: number
  y: number
}

export interface IDElementInstance<Item extends Container> extends IDElementBase {
  engine: Engine
  displayName: string
  displayWidth: number
  displayHeight: number
  centerX: number
  centerY: number
  item?: Item
  children?: IDElementInstance<any>[]
  globalPosition: PointData
  globalCenter: PointData
  offset: PointData
  jsonData: IDElementBase
  locked?: boolean
  hidden?: boolean
  isSelected?: boolean
  isHovered?: boolean
  isDragging?: boolean
  eventMode?: EventMode
}

export interface DElementOptions extends IDElement {
  engine: Engine
  parent?: DElement
}

export abstract class DElement implements IDElementInstance<any> {
  protected dragStartPosition?: { x: number; y: number }
  protected elementStartPosition?: { x: number; y: number }

  engine: Engine
  id: string
  index?: number
  name?: string
  item?: Container
  _locked?: boolean
  _hidden?: boolean
  isDragging?: boolean
  outline: Outline
  boundingBox: BoundingBox
  children?: DElement[]
  parent?: DElement

  constructor(options: DElementOptions) {
    this.engine = options.engine
    this.parent = options.parent
    this.id = options.id ?? eid()
    this.name = options.name
    this.index = options.index
    this._locked = !!options.locked
    this._hidden = !!options.hidden
    this.outline = new Outline(this)
    this.boundingBox = new BoundingBox(this)
  }

  get type() {
    return 'DGraphics'
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

  get rotation() {
    return this.item?.rotation
  }

  get canSelect() {
    return this.parent?.type === 'Frame'
  }

  get locked() {
    return this._locked ?? false
  }

  set locked(locked: boolean) {
    this.setLocked(locked)
  }

  setLocked(locked: boolean) {
    this._locked = locked
    this.eventMode = this._locked ? 'none' : 'auto'
  }

  get hidden() {
    return this._hidden ?? false
  }

  set hidden(value: boolean) {
    this.setHidden(value)
  }

  setHidden(value: boolean) {
    this._hidden = value
    if (this.item) {
      this.item.visible = !value
    }
  }

  get isSelected() {
    return this.operation?.selection.has(this) ?? false
  }

  get displayName() {
    return this.name ?? 'Element'
  }

  get x() {
    return this.item?.x ?? 0
  }

  get y() {
    return this.item?.y ?? 0
  }

  get centerX() {
    return this.item?.x ?? 0
  }

  get centerY() {
    return this.item?.y ?? 0
  }

  get width() {
    return this.item?.width ?? 0
  }

  get height() {
    return this.item?.height ?? 0
  }

  get displayWidth() {
    return this.width * this.engine.zoomRatio
  }

  get displayHeight() {
    return this.height * this.engine.zoomRatio
  }

  get globalPosition() {
    return this.item?.getGlobalPosition() ?? { x: 0, y: 0 }
  }

  get globalCenter() {
    return this.globalPosition
  }

  get offset() {
    return {
      x: this.x - (this.globalPosition?.x ?? 0),
      y: this.y - (this.globalPosition?.y ?? 0),
    }
  }

  setPostion(x: number, y: number) {
    this.item?.position.set(x, y)
    this.outline.position.set(x, y)
  }

  setRotation(rotation: number) {
    if (this.item) {
      this.item.rotation = rotation
    }
  }

  setupInteractive() {
    if (this.item) {
      this.item.on('pointerenter', this.handlePointerEnter)
      this.item.on('pointerleave', this.handlePointerLeave)
      this.item.on('pointerdown', this.handlePointerDown)
      this.item.on('pointertap', this.handlePointerTap)
      this.eventMode = this.locked ? 'none' : 'static'
    }
  }

  renderOutline() {
    this.outline.update()
  }

  handlePointerEnter(event: FederatedPointerEvent) {
    const hoverEvent = new HoverElementEvent({
      source: this,
      target: this,
    })

    this.engine.events.emit('element:hover', hoverEvent)
  }

  handlePointerLeave(event: FederatedPointerEvent) {
    const hoverEvent = new HoverElementEvent({
      source: null,
      target: null,
    })

    this.engine.events.emit('element:hover', hoverEvent)
  }

  handlePointerDown(event: FederatedPointerEvent) {
    this.handleDragStart(event)
    event.preventDefault()
    event.stopPropagation()
  }

  handlePointerTap(event: FederatedPointerEvent) {
    if (this.canSelect) {
      this.operation?.selection.safeSelect(this)
      event.stopPropagation()
      event.preventDefault()
    }
  }

  handleDragStart(event: PointerEvent) {
    this.isDragging = true
    this.engine.isDragging = true
    // 记录拖拽开始时的鼠标位置
    this.dragStartPosition = {
      x: event.clientX,
      y: event.clientY,
    }
    // 记录元素开始时的位置
    this.elementStartPosition = {
      x: this.x,
      y: this.y,
    }
    this.engine.events.on('pointermove', this.handleDrageMove)
    this.engine.events.on('pointerup', this.handleDragEnd)
  }

  handleDrageMove(event: PointerEvent) {
    if (this.isDragging && this.dragStartPosition && this.elementStartPosition) {
      // 计算鼠标移动的距离
      const dx = event.clientX - this.dragStartPosition.x
      const dy = event.clientY - this.dragStartPosition.y

      // 更新元素位置
      this.setPostion(
        this.elementStartPosition.x + dx / this.engine.zoomRatio,
        this.elementStartPosition.y + dy / this.engine.zoomRatio
      )
      // 更新 outline 位置
      this.outline.hide()
      this.boundingBox.hide()
    }
  }

  handleDragEnd() {
    if (this.isDragging) {
      this.isDragging = false
      this.engine.isDragging = false

      // TODO: 改为事件触发
      this.boundingBox.show()
    }
  }

  findById(id: string): DElement | undefined {
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

  get jsonData(): IDElementBase {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      x: this.x,
      y: this.y,
    }
  }
}

export function eid(): string {
  const nanoid = customAlphabet('1234567890abcdef', 16)

  return nanoid()
}
