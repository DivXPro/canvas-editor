import { action, computed, makeObservable, observable } from 'mobx'
import { FillStyle, Graphics, StrokeStyle } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'
import { Outline } from '../Outline'

import { eid, IDElement, IDElementInstance } from './DElement'

export interface GraphicsData {
  data: any
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface IDGraphics extends IDElement {
  graphics: GraphicsData
}

export interface DGraphicsOptions extends IDGraphics {
  app: DesignApplication
}

export abstract class DGraphics implements IDElementInstance<Graphics> {
  private dragStartPosition?: { x: number; y: number }
  private elementStartPosition?: { x: number; y: number }

  app: DesignApplication
  id: string
  name?: string
  _width: number
  _height: number
  index: number = 0
  item: Graphics
  graphics: GraphicsData
  locked?: boolean
  hidden?: boolean
  _isHovered?: boolean
  _isSelected?: boolean
  isDraging?: boolean
  outline: Outline

  constructor(options: DGraphicsOptions) {
    this.app = options.app
    makeObservable(this, {
      id: observable,
      name: observable,
      index: observable,
      locked: observable,
      hidden: observable,
      isDraging: observable,
      isHovered: computed,
      isSelected: computed,
      type: computed,
      displayName: computed,
      x: computed,
      y: computed,
      globalPosition: computed,
      width: computed,
      height: computed,
      boundX: computed,
      boundY: computed,
      boundWidth: computed,
      boundHeight: computed,
      jsonData: computed,
      setWidth: action.bound,
      setHeight: action.bound,
      setHidden: action.bound,
      setIsHovered: action.bound,
      setIsSelected: action.bound,
      setPostion: action.bound,
      handlePointerLeave: action.bound,
      handlePointerDown: action.bound,
      handleDragStart: action.bound,
      handleDrageMove: action.bound,
      handleDragEnd: action.bound,
    })
    this.id = options.id ?? eid()
    this.name = options.name
    this.graphics = options.graphics
    this.locked = !!options.locked
    this.hidden = !!options.hidden
    this.item = new Graphics({
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    })
    this._width = options.width
    this._height = options.height
    this.outline = new Outline(this)
    this.setupInteractiveEvents()
  }

  get type() {
    return 'DGraphics'
  }

  get displayWidth() {
    return this.item.getBounds().width
  }

  get displayHeight() {
    return this.item.getBounds().height
  }

  get rotation() {
    return this.item?.rotation
  }

  setHidden(value: boolean) {
    this.hidden = value
    this.item.visible = !value
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
    return this.name ?? 'DGraphics'
  }

  get x() {
    return this.item.x
  }

  get y() {
    return this.item.y
  }

  get width() {
    return this._width
  }

  set width(value: number) {
    this.setWidth(value)
  }

  setWidth(value: number) {
    this._width = value
  }

  get height() {
    return this._height
  }

  set height(value: number) {
    this.setHeight(value)
  }

  setHeight(value: number) {
    this._height = value
  }

  get boundX() {
    return this.item.getBounds().x
  }

  get boundY() {
    return this.item.getBounds().y
  }

  get boundWidth() {
    return this.item.getBounds().width
  }

  get boundHeight() {
    return this.item.getBounds().height
  }

  get globalPosition() {
    return this.item.getGlobalPosition()
  }

  get jsonData(): IDGraphics {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      locked: this.locked,
      hidden: this.hidden,
      graphics: this.graphics,
    }
  }

  setPostion(x: number, y: number) {
    this.item.position.set(x, y)
    this.outline.position.set(x, y)
  }

  setupInteractiveEvents() {
    this.item.eventMode = 'dynamic'
    this.item.on('pointerenter', () => (this.isHovered = true))
    this.item.on('pointerleave', this.handlePointerLeave)
    this.item.on('pointerdown', this.handlePointerDown)
  }

  renderOutline() {
    this.outline.render()
  }

  handlePointerLeave(event: PointerEvent) {
    console.log('pointerleave', event, this.item.isInteractive())
    this.isHovered = false
  }

  handlePointerDown(event: PointerEvent) {
    this.isSelected = true
    this.handleDragStart(event)
  }

  handleDragStart(event: PointerEvent) {
    this.isDraging = true
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
    if (this.isDraging && this.dragStartPosition && this.elementStartPosition) {
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
    this.isDraging = false
  }
}
