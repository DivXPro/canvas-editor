import { FederatedPointerEvent } from 'pixi.js'

import { EventDriver } from './EventDriver'

export class DragDropDriver extends EventDriver {
  private onPointerDown(event: FederatedPointerEvent) {
    this.engine.operation?.dragMove.dragStart(event)
  }

  private onPointerMove(event: FederatedPointerEvent) {
    this.engine.operation?.dragMove.dragMove(event)
  }

  private onPointerUp(event: FederatedPointerEvent) {
    this.engine.operation?.dragMove.dragStop(event)
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
