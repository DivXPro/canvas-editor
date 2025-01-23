import { Application, ApplicationOptions, Size, EventEmitter, PointData, Graphics } from 'pixi.js'

import { DFrame, IDFrame } from './elements/DFrame'
import { DElement, IDElement } from './elements/DElement'
import { DGroup, IDGroup } from './elements/DGroup'
import { DRectangle, IDRectangle } from './elements/DRectangle'
import { OutlineLayer } from './OutlineLayer'
import { DText, IDText } from './elements/DText'
import { BoundingLayer } from './BoundingLayer'
import { Selection } from './Selection'
import { Cursor } from './Cursor'
import { EventDriver } from './drivers/EventDriver'
import { PointerMoveDriver } from './drivers/PointerMoveDriver'
import { DragDropDriver } from './drivers'

export interface DesignApplicationOptions extends Partial<ApplicationOptions> {
  enableZoom?: boolean
  canvasSize?: Size
  data: IDApp
}

const DefaultFrame: IDFrame = {
  width: 512,
  height: 512,
  type: 'Frame',
  x: 0,
  y: 0,
}

export interface IDApp {
  id: string
  name: string
  frame: IDFrame
}

export class DesignApplication extends Application {
  id?: string
  name?: string
  maxZoom = 2
  minZoom = 0.5
  zoomRatio = 1
  enableZoom = false
  isZooming = false
  isDragging = false
  lastPointerDown?: PointData
  frame?: DFrame
  outlineLayer?: OutlineLayer
  boundingLayer?: BoundingLayer
  events = new EventEmitter()
  cursor = new Cursor(this)
  selection = new Selection({ app: this })
  drivers: EventDriver[] = []
  data?: IDApp

  constructor() {
    super()
  }

  async init(options: DesignApplicationOptions) {
    await super.init(options)
    const { enableZoom, data, background } = options

    this.id = data.id
    this.name = data.name
    this.canvas.style.backgroundColor = background?.toString() ?? '0xcfcfcf'
    this.enableZoom = enableZoom ?? false
    this.data = data
    this.initFrame()
    this.initGuideLayers()
    this.initEventEmitter()
    this.initDrivers()
    if (this.enableZoom) {
      this.activeWheelZoom()
    }
  }

  initFrame() {
    const frame = this.data?.frame ?? DefaultFrame
    const point = new Graphics().rect(-0.5, -0.5, 1, 1).fill({ color: 'red' })

    this.frame = new DFrame({
      app: this,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      rotation: frame.rotation,
      items: frame.items,
      type: 'Frame',
    })
    this.stage.position.set((this.screen.width - this.frame.width) / 2, (this.screen.height - this.frame.height) / 2)
    this.stage.addChild(this.frame.item, point)
  }

  initGuideLayers() {
    this.outlineLayer = new OutlineLayer()
    this.boundingLayer = new BoundingLayer()
    this.stage.addChild(this.outlineLayer, this.boundingLayer)
  }

  initEventEmitter() {
    this.stage.eventMode = 'static'

    // point
    this.canvas.addEventListener('pointerenter', e => this.events.emit('pointerenter', e), { passive: false })
    this.canvas.addEventListener('pointerover', e => this.events.emit('pointerover', e), { passive: false })
    this.canvas.addEventListener('pointerleave', e => this.events.emit('pointerleave', e), { passive: false })
    this.canvas.addEventListener('pointertap', e => this.events.emit('pointertap', e), { passive: false })
    this.canvas.addEventListener('pointerdown', e => this.events.emit('pointerdown', e), { passive: false })
    this.canvas.addEventListener('pointermove', e => this.events.emit('pointermove', e), { passive: false })
    this.canvas.addEventListener('pointerup', e => this.events.emit('pointerup', e), { passive: false })
    this.canvas.addEventListener('pointerupoutside', e => this.events.emit('pointerupoutside', e), { passive: false })
    this.canvas.addEventListener('pointercancel', e => this.events.emit('pointercancel', e), { passive: false })

    // wheel
    this.canvas.addEventListener('wheel', e => this.events.emit('wheel', e), { passive: false })

    this.stage.on(
      'pointertap',
      () => {
        this.selection.clear()
      },
      { passive: false }
    )
  }

  initDrivers() {
    this.drivers.push(new PointerMoveDriver(this), new DragDropDriver(this))
    this.drivers.forEach(driver => {
      driver.attach()
    })
  }

  activeWheelZoom() {
    if (this.enableZoom) {
      this.events.on('wheel', this.applyZoom.bind(this))
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
    this.frame?.setZoom(this.zoomRatio)
    this.outlineLayer?.scale.set(this.zoomRatio)
    this.boundingLayer?.scale.set(this.zoomRatio)
    event.preventDefault()
    event.stopPropagation()
  }

  generateElement(item: IDElement, parent?: DElement) {
    switch (item.type) {
      case 'Frame':
        return new DFrame({ app: this, ...(item as IDFrame) })
      case 'Group':
        return new DGroup({ app: this, parent, ...(item as IDGroup) })
      case 'Rectangle':
        return new DRectangle({ app: this, parent, ...(item as IDRectangle) })
      case 'Text':
        return new DText({ app: this, parent, ...(item as IDText) })
      default:
        break
    }
  }

  get jsonData() {
    return {
      id: this.data?.id,
      name: this.data?.name,
      frame: this.frame?.jsonData,
    }
  }
}
