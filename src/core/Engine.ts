import { Application, ApplicationOptions, Size, PointData, EventEmitter } from 'pixi.js'

import { DFrame, IDFrame } from './elements/DFrame'
import { DElement, IDElement } from './elements/DElement'
import { DGroup, IDGroup } from './elements/DGroup'
import { DRectangle, IDRectangle } from './elements/DRectangle'
import { OutlineLayer } from './components/OutlineLayer'
import { DText, IDText } from './elements/DText'
import { BoundingLayer } from './components/BoundingLayer'
import { EventDriver, SelectionAreaDriver } from './drivers'
import { BackgroundLayer } from './components/BackgroundLayer'
import { SelectionAreaLayer } from './components/SelectionAreaLayer'
import { Operation } from './models/Operation'

export interface EngineOptions extends Partial<ApplicationOptions> {
  enableZoom?: boolean
  canvasSize?: Size
  data: IDApp
  background?: number
}

export interface IDApp {
  id: string
  name: string
  frame: IDFrame
}

export class Engine {
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
  drivers: EventDriver[] = []
  data?: IDApp
  app: Application
  operation?: Operation

  constructor() {
    this.app = new Application()
  }

  async init(options: EngineOptions) {
    await this.app.init(options)
    const { enableZoom, data, background } = options

    this.id = data.id
    this.name = data.name
    this.enableZoom = enableZoom ?? false
    this.data = data

    // 初始化背景层
    this.backgroundLayer = new BackgroundLayer({ app: this, color: background })
    this.app.stage.addChildAt(this.backgroundLayer, 0)

    this.operation = new Operation(this)
    this.initGuideLayers()
    this.initEventEmitter()
    this.initDrivers()
    if (this.enableZoom) {
      this.activeWheelZoom()
    }
  }

  initGuideLayers() {
    this.outlineLayer = new OutlineLayer()
    this.boundingLayer = new BoundingLayer()
    this.selectionAreaLayer = new SelectionAreaLayer(this)
    this.app.stage.addChild(this.outlineLayer, this.boundingLayer, this.selectionAreaLayer)
  }

  initEventEmitter() {
    this.app.stage.eventMode = 'static'
    // wheel
    this.app.canvas.addEventListener('wheel', e => this.events.emit('wheel', e), { passive: false })
  }

  initDrivers() {
    this.drivers.push(new SelectionAreaDriver(this))
    // this.drivers.push(new HoverDriver(this))
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
    event.preventDefault()
    event.stopPropagation()
  }

  generateElement(item: IDElement, parent?: DElement) {
    switch (item.type) {
      case 'Frame':
        return new DFrame({ engine: this, ...(item as IDFrame) })
      case 'Group':
        return new DGroup({ engine: this, parent, ...(item as IDGroup) })
      case 'Rectangle':
        return new DRectangle({ engine: this, parent, ...(item as IDRectangle) })
      case 'Text':
        return new DText({ engine: this, parent, ...(item as IDText) })
      default:
        break
    }
  }

  get stage() {
    return this.app.stage
  }

  get screen() {
    return this.app.screen
  }

  get renderer() {
    return this.app.renderer
  }

  get canvas() {
    return this.app.canvas
  }

  get jsonData() {
    return {
      id: this.data?.id,
      name: this.data?.name,
      frame: this.frame?.jsonData,
    }
  }
}
