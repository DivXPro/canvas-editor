import { Application, ApplicationOptions, Size, PointData, EventEmitter } from 'pixi.js'

import { OutlineLayer } from '../components/OutlineLayer'
import { DragDriver, EventDriver, SelectionAreaDriver } from '../drivers'
import { BackgroundLayer } from '../components/BackgroundLayer'
import { SelectionAreaLayer } from '../components/SelectionAreaLayer'
import { ControlBox } from '../components/ControlBox'
import { ZoomChangeEvent } from '../events/view/ZoomChangeEvent'
import { NodeBase } from '../elements'
import { enableSelectionEffect, enableCursorEffect, enableDragEffect } from '../effects'

import { Workbench } from './Workbench'
import { Cursor } from './Cursor'

export interface EngineOptions extends Partial<ApplicationOptions> {
  enableZoom?: boolean
  canvasSize: Size
  data: ICanva
  background?: number
}

export interface ICanva {
  id?: string
  title?: string
  description?: string
  nodes?: NodeBase[]
}

export class Engine {
  maxZoom = 2
  minZoom = 0.5
  zoomRatio = 1
  canvasSize?: Size
  enableZoom = false
  lastPointerDown?: PointData
  outlineLayer?: OutlineLayer
  backgroundLayer?: BackgroundLayer
  selectionAreaLayer?: SelectionAreaLayer
  controlBox?: ControlBox
  events = new EventEmitter()
  drivers: EventDriver[] = []
  app: Application
  workbench: Workbench
  cursor: Cursor

  constructor() {
    this.app = new Application()
    this.workbench = new Workbench(this)
    this.cursor = new Cursor(this)
  }

  async init(options: EngineOptions) {
    const { enableZoom, data, background, canvasSize } = options

    this.enableZoom = enableZoom ?? false
    this.canvasSize = canvasSize
    await this.app.init(options)
    this.initGuideLayers(background)
    this.initEventEmitter()
    this.workbench.init(data)
    this.initDrivers()
    this.initEffects()
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
    this.app.canvas.addEventListener('click', e => this.events.emit('click', e), { passive: false })

    this.app.canvas.addEventListener('wheel', e => this.events.emit('wheel', e), { passive: false })
  }

  initDrivers() {
    this.drivers.push(new DragDriver(this))
    this.drivers.push(new SelectionAreaDriver(this))
    this.drivers.forEach(driver => {
      driver.attach()
    })
  }

  initEffects() {
    enableCursorEffect(this)
    enableSelectionEffect(this)
    enableDragEffect(this)
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
    this.workbench.setZoom(this.zoomRatio)
    this.workbench?.hover.clear()
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

  handlePointerdown(e: PointerEvent) {
    if (e.buttons === 2) {
      console.debug('btn 2')
      // this.workspaceProps?.openContextMenu?.(e)
    }
  }
}
