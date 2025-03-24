import { ApplicationOptions, Size, EventEmitter } from 'pixi.js'

import { DragDriver, EventDriver, SelectionAreaDriver, KeyboardDriver } from '../drivers'
import { NodeBase } from '../nodes'
import {
  enableSelectionEffect,
  enableCursorEffect,
  enableDragEffect,
  enableTransformEffect,
  enableZoomEffect,
  enableKeyboardEffect,
} from '../effects'
import { CanvasApp } from '../components/Canvas'
import { ICustomEvent } from '../events'
import { CopyNodes, DeleteNodes, PasteNodes } from '../shortcuts/NodeMutation'

import { Workspace } from './Workspace'
import { Cursor, CursorType } from './Cursor'
import { Keyboard } from './Keyboard'
import { Shortcut } from './Shortcut'

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
  workspace: Workspace
  cursor: Cursor
  keyboard: Keyboard

  constructor() {
    this.app = new CanvasApp()
    this.shortcuts = [DeleteNodes, CopyNodes, PasteNodes]
    this.cursor = new Cursor(this)
    this.keyboard = new Keyboard(this)
    this.workspace = new Workspace(this)
  }

  async init(options: EngineOptions) {
    const { data, background, canvasSize } = options

    await this.app.init(options)
    this.cursor.type = CursorType.Default
    this.workspace.initGuideLayers(background)
    this.initEventEmitter()
    this.workspace.init({
      canva: data,
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

    // this.app.canvas.addEventListener('wheel', e => { console.log('wheel', e) }, { passive: false })
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
    enableZoomEffect(this)
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
