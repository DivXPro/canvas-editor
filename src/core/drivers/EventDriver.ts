import { DesignApplication } from '../DesignApplication'

export abstract class EventDriver {
  app: DesignApplication

  constructor(app: DesignApplication) {
    this.app = app
  }

  get events() {
    return this.app.events
  }

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    this.app.canvas.addEventListener(type, listener, options)
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ) {
    this.app.canvas.removeEventListener(type, listener, options)
  }

  attach() {
    // 在子类实现
  }

  detach() {
    // 在子类实现
  }
}
