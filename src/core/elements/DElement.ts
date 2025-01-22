import { customAlphabet } from 'nanoid'
import { Container, PointData } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'
import { Outline } from '../Outline'
import { BoundingBox } from '../BoundingBox'
import { SelectElementEvent, UnselectElementEvent } from '../events/SelectElementEvent'

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
  parent?: DElement
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
  isDragging?: boolean
  outline: Outline
  boundingBox: BoundingBox
  children?: DElement[]
  parent?: DElement

  constructor(options: DElementOptions) {
    this.app = options.app
    this.parent = options.parent
    this.id = options.id ?? eid()
    this.name = options.name
    this.index = options.index
    this.locked = !!options.locked
    this._hidden = !!options.hidden
    this.outline = new Outline(this)
    this.boundingBox = new BoundingBox(this)
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

  get canSelect() {
    return this.parent?.type === 'Frame'
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
    if (!this.app.isDragging) {
      if (this._isHovered) {
        this.outline.show()
      } else {
        this.outline.hide()
      }
    }
  }

  get isSelected() {
    return this.app.selection.has(this) ?? false
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

  get scale() {
    return this.item?.scale ?? { x: 1, y: 1 }
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
      this.item.on('pointerenter', this.handlePointerEnter)
      this.item.on('pointerleave', this.handlePointerLeave)
      this.item.on('pointerdown', this.handlePointerDown)
      this.item.on('pointertap', this.handlePointerTap)
    }
    this.app.events.on('select:element', (e: SelectElementEvent) => {
      if (Array.isArray(e.data.source) && e.data.source.includes(this)) {
        this.boundingBox.show()
      } else {
        this.boundingBox.hide()
      }
    })
    this.app.events.on('unselect:element', (e: UnselectElementEvent) => {
      if (Array.isArray(e.data.source) && e.data.source.includes(this)) {
        this.boundingBox.show()
      } else {
        this.boundingBox.hide()
      }
    })
  }

  renderOutline() {
    this.outline.update()
  }

  handlePointerEnter(event: PointerEvent) {
    this.isHovered = true
  }

  handlePointerLeave(event: PointerEvent) {
    this.isHovered = false
  }

  handlePointerTap(event: PointerEvent) {
    console.log('handlePointerTap')
    if (this.canSelect) {
      this.app.selection.safeSelect(this)
      event.stopPropagation()
      event.preventDefault()
    }
  }

  handlePointerDown(event: PointerEvent) {
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
      this.outline.hide()
      this.boundingBox.hide()
    }
  }

  handleDragEnd() {
    if (this.isDragging) {
      this.isDragging = false
      this.app.isDragging = false

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
