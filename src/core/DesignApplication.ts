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
import { EventDriver, PointerMoveDriver, DragDropDriver, SelectionAreaDriver } from './drivers'
import { BackgroundLayer } from './BackgroundLayer'
import { SelectionAreaLayer } from './SelectionAreaLayer'

export interface DesignApplicationOptions extends Partial<ApplicationOptions> {
  enableZoom?: boolean
  canvasSize?: Size
  data: IDApp
  background?: number
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
  backgroundLayer?: BackgroundLayer
  selectionAreaLayer?: SelectionAreaLayer
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
    this.enableZoom = enableZoom ?? false
    this.data = data

    // 初始化背景层
    this.backgroundLayer = new BackgroundLayer({ app: this, color: background })
    this.stage.addChildAt(this.backgroundLayer, 0)

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
    this.stage.addChild(this.frame.item)
  }

  initGuideLayers() {
    this.outlineLayer = new OutlineLayer()
    this.boundingLayer = new BoundingLayer()
    this.selectionAreaLayer = new SelectionAreaLayer(this)
    this.stage.addChild(this.outlineLayer, this.boundingLayer, this.selectionAreaLayer)
  }

  initEventEmitter() {
    this.stage.eventMode = 'static'
    // wheel
    this.canvas.addEventListener('wheel', e => this.events.emit('wheel', e), { passive: false })
  }

  initDrivers() {
    this.drivers.push(new SelectionAreaDriver(this))
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
