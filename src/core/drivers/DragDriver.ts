import { FederatedPointerEvent } from 'pixi.js'

import { EventDriver } from './EventDriver'

export class DragDriver extends EventDriver {
  private onPointerDown(event: FederatedPointerEvent) {
    // if (this.engine.operation?.dragMove.dragging) {
    //   this.engine.operation?.dragMove.dragStart(event)
    // } else if (this.engine.operation?.dragMove.rotating) {
    //   this.engine.operation?.dragMove.rotateStart(event)
    // }
  }

  private onPointerMove(event: FederatedPointerEvent) {
    if (this.engine.operation?.dragMove.dragging) {
      this.engine.operation?.dragMove.dragMove(event)
    } else if (this.engine.operation?.dragMove.rotating) {
      this.engine.operation?.dragMove.rotateMove(event)
    }
  }

  private onPointerUp(event: FederatedPointerEvent) {
    if (this.engine.operation?.dragMove.dragging) {
      this.engine.operation?.dragMove.dragStop(event)
    } else if (this.engine.operation?.dragMove.rotating) {
      this.engine.operation?.dragMove.rotateStop(event)
    }
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
