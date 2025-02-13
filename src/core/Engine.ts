import { Application, ApplicationOptions, Size, PointData, EventEmitter } from 'pixi.js'

import { IDFrameBase } from './elements/DFrame'
import { OutlineLayer } from './components/OutlineLayer'
import { BoundingLayer } from './components/BoundingLayer'
import { DragDropDriver, EventDriver, SelectionAreaDriver } from './drivers'
import { BackgroundLayer } from './components/BackgroundLayer'
import { SelectionAreaLayer } from './components/SelectionAreaLayer'
import { Operation } from './models/Operation'
import { DNode } from './elements'
import { ControlBox } from './components/ControlBox'

export interface EngineOptions extends Partial<ApplicationOptions> {
  enableZoom?: boolean
  canvasSize?: Size
  data: IDApp
  background?: number
}

export interface IDApp {
  id: string
  name: string
  frame: IDFrameBase
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
  outlineLayer?: OutlineLayer
  boundingLayer?: BoundingLayer
  backgroundLayer?: BackgroundLayer
  selectionAreaLayer?: SelectionAreaLayer
  controlBox?: ControlBox
  events = new EventEmitter()
  drivers: EventDriver[] = []
  data?: IDApp
  app: Application
  operation?: Operation
  focus?: DNode

  constructor() {
    this.app = new Application()
  }

  async init(options: EngineOptions) {
    await this.app.init(options)
    this.app.canvas.addEventListener('contextmenu', e => {
      e.preventDefault()
    })

    const { enableZoom, data, background } = options

    this.id = data.id
    this.name = data.name
    this.enableZoom = enableZoom ?? false
    this.data = data

    this.initGuideLayers(background)
    this.initEventEmitter()
    this.operation = new Operation(this)
    this.operation.init(data.frame)
    this.initDrivers()
    if (this.enableZoom) {
      this.activeWheelZoom()
    }
  }

  initGuideLayers(background?: number | string) {
    this.backgroundLayer = new BackgroundLayer({ app: this, color: background })
    this.outlineLayer = new OutlineLayer(this)
    this.boundingLayer = new BoundingLayer(this)
    this.controlBox = new ControlBox(this)
    this.selectionAreaLayer = new SelectionAreaLayer(this)
    this.app.stage.addChild(
      this.backgroundLayer,
      this.outlineLayer,
      this.boundingLayer,
      this.controlBox,
      this.selectionAreaLayer
    )
  }

  initEventEmitter() {
    this.app.stage.eventMode = 'static'
    // wheel
    // this.app.canvas.addEventListener('wheel', e => this.events.emit('wheel', e), { passive: false })
  }

  initDrivers() {
    this.drivers.push(new SelectionAreaDriver(this))
    this.drivers.push(new DragDropDriver(this))
    this.drivers.forEach(driver => {
      driver.attach()
    })
  }

  activeWheelZoom() {
    if (this.enableZoom) {
      // this.events.on('wheel', this.applyZoom.bind(this))
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
    this.operation?.frame?.setZoom(this.zoomRatio)
    this.boundingLayer?.update()
    this.operation?.hover.clear()
    event.preventDefault()
    event.stopPropagation()
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
      frame: this.operation?.frame?.jsonData,
    }
  }
}
