import { Engine } from '../Engine'

export abstract class EventDriver {
  engine: Engine

  constructor(engine: Engine) {
    this.engine = engine
  }

  get events() {
    return this.engine.events
  }

  protected getCanvasPoint(clientX: number, clientY: number) {
    const rect = this.engine.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return { x, y }
  }

  attach() {
    // 在子类实现
  }

  detach() {
    // 在子类实现
  }
}
