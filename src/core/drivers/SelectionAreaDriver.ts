import { FederatedPointerEvent } from 'pixi.js'

import { SelectionAreaStartEvent, SelectionAreaMoveEvent, SelectionAreaEndEvent } from '../events'

import { EventDriver } from './EventDriver'

export class SelectionAreaDriver extends EventDriver {
  private request?: number

  get selecting() {
    return this.engine.operation?.selection.selecting ?? false
  }

  set selecting(value: boolean) {
    if (this.engine.operation) {
      this.engine.operation.selection.selecting = value
    }
  }

  private onPointerDown = (e: FederatedPointerEvent) => {
    this.engine.operation?.selection.clear()
    const canvasPosition = this.engine.stage.toLocal(e.global)

    this.selecting = true
    const event = new SelectionAreaStartEvent({
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      target: e.target,
      view: e.view,
      canvasX: canvasPosition.x,
      canvasY: canvasPosition.y,
    })

    this.events.emit(event.type, event)
  }

  private onPointerMove = (e: FederatedPointerEvent) => {
    if (!this.selecting) return

    this.request = requestAnimationFrame(() => {
      this.request != null && cancelAnimationFrame(this.request)
      const canvasPosition = this.engine.stage.toLocal(e.global)
      const event = new SelectionAreaMoveEvent({
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        target: e.target,
        view: e.view,
        canvasX: canvasPosition.x,
        canvasY: canvasPosition.y,
      })

      this.events.emit(event.type, event)
    })
  }

  private onPointerUp = (e: FederatedPointerEvent) => {
    if (!this.selecting) return

    this.selecting = false
    const canvasPosition = this.engine.stage.toLocal(e.global)
    const event = new SelectionAreaEndEvent({
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      target: e.target,
      view: e.view,
      canvasX: canvasPosition.x,
      canvasY: canvasPosition.y,
    })

    this.events.emit(event.type, event)
  }

  attach() {
    this.engine.stage.on('pointerdown', this.onPointerDown.bind(this))
    this.engine.stage.on('pointermove', this.onPointerMove.bind(this))
    this.engine.stage.on('pointerup', this.onPointerUp.bind(this))
    this.engine.stage.on('pointerupoutside', this.onPointerUp.bind(this))
  }

  detach() {
    this.engine.stage.off('pointerdown', this.onPointerDown.bind(this))
    this.engine.stage.off('pointermove', this.onPointerMove.bind(this))
    this.engine.stage.off('pointerup', this.onPointerUp.bind(this))
    this.engine.stage.off('pointerupoutside', this.onPointerUp.bind(this))
  }
}
