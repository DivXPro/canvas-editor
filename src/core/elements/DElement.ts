import { customAlphabet } from 'nanoid'
import { Container, PointData } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'
import { Outline } from '../Outline'

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
}

export interface IDElementInstance<Item extends Container> extends IDElementBase {
  app: DesignApplication
  displayName: string
  centerX: number
  centerY: number
  item?: Item
  children?: IDElementInstance<any>[]
  globalPosition?: PointData
  jsonData: IDElementBase
  locked?: boolean
  hidden?: boolean
  isSelected?: boolean
  isHovered?: boolean
  isDragging?: boolean
}

export interface DElementOptions extends IDElement {
  app: DesignApplication
}
export abstract class DElement implements IDElementInstance<any> {
  protected dragStartPosition?: { x: number; y: number }
  protected elementStartPosition?: { x: number; y: number }

  app: DesignApplication
  id: string
  index?: number
  name?: string
  item?: Container
  locked?: boolean
  _hidden?: boolean
  _isHovered?: boolean
  _isSelected?: boolean
  isDragging?: boolean
  outline: Outline

  constructor(options: DElementOptions) {
    this.app = options.app
    this.id = options.id ?? eid()
    this.name = options.name
    this.index = options.index
    this.locked = !!options.locked
    this._hidden = !!options.hidden
    this.outline = new Outline(this)
  }

  get type() {
    return 'DGraphics'
  }

  get rotation() {
    return this.item?.rotation
  }

  get hidden() {
    return this._hidden
  }

  setHidden(value: boolean) {
    this._hidden = value
    if (this.item) {
      this.item.visible = !value
    }
  }

  get isHovered() {
    return this._isHovered ?? false
  }

  set isHovered(value: boolean) {
    this.setIsHovered(value)
  }

  setIsHovered(value: boolean) {
    this._isHovered = value
    if (this._isHovered) {
      this.outline.show()
    } else {
      this.outline.hide()
    }
  }

  get isSelected() {
    return this._isSelected ?? false
  }

  set isSelected(value: boolean) {
    this.setIsSelected(value)
  }

  setIsSelected(value: boolean) {
    this._isSelected = value
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

  get globalPosition() {
    return this.item?.getGlobalPosition()
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

  setupInteractiveEvents() {
    if (this.item) {
      this.item.eventMode = 'dynamic'
      this.item.on('pointerenter', () => (this.isHovered = true))
      this.item.on('pointerleave', this.handlePointerLeave)
      this.item.on('pointerdown', this.handlePointerDown)
    }
  }

  renderOutline() {
    this.outline.render()
  }

  handlePointerLeave(event: PointerEvent) {
    console.log('pointerleave', event, this.item?.isInteractive())
    this.isHovered = false
  }

  handlePointerDown(event: PointerEvent) {
    console.log('pointerdown', event, this.item?.isInteractive())

    this.isSelected = true
    this.handleDragStart(event)
  }

  handleDragStart(event: PointerEvent) {
    this.isDragging = true
    this.app.isDragging = true
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
    this.app.events.on('pointermove', this.handleDrageMove)
    this.app.events.on('pointerup', this.handleDragEnd)
  }

  handleDrageMove(event: PointerEvent) {
    if (this.isDragging && this.dragStartPosition && this.elementStartPosition) {
      // 计算鼠标移动的距离
      const dx = event.clientX - this.dragStartPosition.x
      const dy = event.clientY - this.dragStartPosition.y

      // 更新元素位置
      this.setPostion(
        this.elementStartPosition.x + dx / this.app.zoomRatio,
        this.elementStartPosition.y + dy / this.app.zoomRatio
      )
      // 更新 outline 位置
      this.renderOutline()
    }
  }

  handleDragEnd() {
    this.isDragging = false
    this.app.isDragging = false
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
