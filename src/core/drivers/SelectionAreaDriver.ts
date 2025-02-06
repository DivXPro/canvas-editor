import { FederatedPointerEvent } from 'pixi.js'

import { SelectionAreaStartEvent, SelectionAreaMoveEvent, SelectionAreaEndEvent } from '../events'

import { EventDriver } from './EventDriver'

export class SelectionAreaDriver extends EventDriver {
  private request?: number
  private isSelecting = false

  onPointerDown = (e: FederatedPointerEvent) => {
    this.isSelecting = true
    const canvasPosition = this.app.stage.toLocal(e.global)
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

  onPointerMove = (e: FederatedPointerEvent) => {
    if (!this.isSelecting) return

    this.request = requestAnimationFrame(() => {
      this.request != null && cancelAnimationFrame(this.request)
      const canvasPosition = this.app.stage.toLocal(e.global)
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

  onPointerUp = (e: FederatedPointerEvent) => {
    if (!this.isSelecting) return

    this.isSelecting = false
    const canvasPosition = this.app.stage.toLocal(e.global)
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
    this.app.stage.on('pointerdown', this.onPointerDown.bind(this))
    this.app.stage.on('pointermove', this.onPointerMove.bind(this))
    this.app.stage.on('pointerup', this.onPointerUp.bind(this))
    this.app.stage.on('pointerupoutside', this.onPointerUp.bind(this))
  }

  detach() {
    this.app.stage.off('pointerdown', this.onPointerDown.bind(this))
    this.app.stage.off('pointermove', this.onPointerMove.bind(this))
    this.app.stage.off('pointerup', this.onPointerUp.bind(this))
    this.app.stage.off('pointerupoutside', this.onPointerUp.bind(this))
  }
}
