import { ApplicationOptions, Size, EventEmitter } from 'pixi.js'

import { DragDriver, EventDriver, SelectionAreaDriver, KeyboardDriver } from '../drivers'
import { NodeBase } from '../nodes'
import { enableSelectionEffect, enableCursorEffect, enableDragEffect, enableTransformEffect } from '../effects'
import { CanvasApp } from '../components/Canvas'
import { CustomEventClass, ICustomEvent } from '../events'
import { CopyNodes, DeleteNodes, PasteNodes } from '../shortcuts/NodeMutation'

import { Workbench } from './Workbench'
import { Cursor, CursorType } from './Cursor'
import { Keyboard } from './Keyboard'
import { Shortcut } from './Shortcut'
import { enableKeyboardEffect } from '../effects/keyboardEffect'

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
  app: CanvasApp
  shortcuts: Shortcut[] = []
  events = new EventEmitter()
  drivers: EventDriver[] = []
  workbench: Workbench
  cursor: Cursor
  keyboard: Keyboard

  constructor() {
    this.app = new CanvasApp()
    this.shortcuts = [DeleteNodes, CopyNodes, PasteNodes]
    this.cursor = new Cursor(this)
    this.keyboard = new Keyboard(this)
    this.workbench = new Workbench(this)
  }

  async init(options: EngineOptions) {
    const { enableZoom, data, background, canvasSize } = options

    await this.app.init(options)
    this.cursor.type = CursorType.Default
    this.workbench.initGuideLayers(background)
    this.initEventEmitter()
    this.workbench.init({
      canva: data,
      enableZoom,
      canvasSize,
    })
    this.initDrivers()
    this.initEffects()
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
    this.drivers.push(new KeyboardDriver(this))
    this.drivers.forEach(driver => {
      driver.attach()
    })
  }

  initEffects() {
    enableCursorEffect(this)
    enableSelectionEffect(this)
    enableDragEffect(this)
    enableTransformEffect(this)
    enableKeyboardEffect(this)
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

  dispatch(event: ICustomEvent) {
    this.events.emit(event.type, event)
  }

  subscribeTo(type: string, callback: (event: any) => void) {
    this.events.on(type, callback)
  }
}
