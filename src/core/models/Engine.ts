import { Application, ApplicationOptions, Size, PointData, EventEmitter } from 'pixi.js'

import { IDFrameBase } from '../elements/DFrame'
import { OutlineLayer } from '../components/OutlineLayer'
import { DragDriver, EventDriver, SelectionAreaDriver } from '../drivers'
import { BackgroundLayer } from '../components/BackgroundLayer'
import { SelectionAreaLayer } from '../components/SelectionAreaLayer'
import { ControlBox } from '../components/ControlBox'
import { ZoomChangeEvent } from '../events/view/ZoomChangeEvent'

import { Operation } from './Operation'

export interface EngineOptions extends Partial<ApplicationOptions> {
  enableZoom?: boolean
  canvasSize: Size
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
  canvasSize?: Size
  enableZoom = false
  isZooming = false
  isDragging = false
  lastPointerDown?: PointData
  outlineLayer?: OutlineLayer
  backgroundLayer?: BackgroundLayer
  selectionAreaLayer?: SelectionAreaLayer
  controlBox?: ControlBox
  events = new EventEmitter()
  drivers: EventDriver[] = []
  data?: IDApp
  app: Application
  operation: Operation

  constructor() {
    this.app = new Application()
    this.operation = new Operation(this)
  }

  async init(options: EngineOptions) {
    const { enableZoom, data, background, canvasSize } = options

    this.id = data.id
    this.name = data.name
    this.enableZoom = enableZoom ?? false
    this.data = data
    this.canvasSize = canvasSize
    await this.app.init(options)
    this.initGuideLayers(background)
    this.initEventEmitter()
    this.operation.init(data.frame)
    this.initDrivers()
    if (this.enableZoom) {
      this.activeWheelZoom()
    }
  }

  initGuideLayers(background?: number | string) {
    this.backgroundLayer = new BackgroundLayer({ app: this, color: background })
    this.outlineLayer = new OutlineLayer(this)
    this.controlBox = new ControlBox(this)
    this.selectionAreaLayer = new SelectionAreaLayer(this)
    this.app.stage.addChild(this.backgroundLayer, this.outlineLayer, this.controlBox, this.selectionAreaLayer)
  }

  initEventEmitter() {
    this.app.stage.eventMode = 'static'
    // wheel
    this.app.canvas.addEventListener('pointerdown', e => this.events.emit('pointerdown', e), { passive: false })
    this.app.canvas.addEventListener('pointerup', e => this.events.emit('pointerup', e), { passive: false })
    this.app.canvas.addEventListener('pointermove', e => this.events.emit('pointermove', e), { passive: false })
    this.app.canvas.addEventListener('pointertap', e => this.events.emit('pointertap', e), { passive: false })
    this.app.canvas.addEventListener('wheel', e => this.events.emit('wheel', e), { passive: false })
  }

  initDrivers() {
    this.drivers.push(new SelectionAreaDriver(this))
    this.drivers.push(new DragDriver(this))
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
    this.operation?.frame?.setZoom(this.zoomRatio)
    this.operation?.hover.clear()
    this.events.emit('zoom:change', new ZoomChangeEvent({ zoomRatio }))
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

  handlePointerdown(e: PointerEvent) {
    console.debug('handlePointerdown', e, e.buttons)

    if (e.buttons === 2) {
      console.debug('btn 2')
      // this.workspaceProps?.openContextMenu?.(e)
    }
  }
}
