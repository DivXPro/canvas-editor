import { Graphics } from 'pixi.js'
import { DesignApplication } from './DesignApplication'

export class Brush {
  private app: DesignApplication
  private graphics: Graphics
  private isDrawing: boolean = false
  private lastPosition: { x: number, y: number } | null = null
  private brushSize: number = 5
  private brushColor: number = 0x000000 // 黑色

  constructor(app: DesignApplication, graphics: Graphics) {
    this.app = app
    this.graphics = graphics
    this.setupEventListeners()
  }

  setGraphics(graphics: Graphics) {
    this.graphics = graphics
  }

  private setupEventListeners(): void {
    this.app.events.on('touchstart', this.onStart.bind(this))
    this.app.events.on('touchmove', this.onMove.bind(this))
    this.app.events.on('touchend', this.onEnd.bind(this))
    this.app.events.on('touchcancel', this.onEnd.bind(this))

    this.app.events.on('mousedown', this.onStart.bind(this))
    this.app.events.on('mousemove', this.onMove.bind(this))
    this.app.events.on('mouseup', this.onEnd.bind(this))
    this.app.events.on('mouseout', this.onEnd.bind(this))
  }

  private onStart(event: MouseEvent | TouchEvent): void {
    event.preventDefault()
    this.isDrawing = true
    this.lastPosition = this.getPosition(event)
  }

  private onMove(event: MouseEvent | TouchEvent): void {
    event.preventDefault()
    if (!this.isDrawing) return

    const newPosition = this.getPosition(event)
    if (this.lastPosition && newPosition) {
      this.drawLine(this.lastPosition, newPosition)
      this.lastPosition = newPosition
    }
  }

  private onEnd(event: MouseEvent | TouchEvent): void {
    event.preventDefault()
    this.isDrawing = false
    this.lastPosition = null
  }

  private getPosition(event: MouseEvent | TouchEvent): { x: number, y: number } | null {
    const rect = this.app.canvas.getBoundingClientRect()
    let clientX, clientY

    if (event instanceof MouseEvent) {
      clientX = event.clientX
      clientY = event.clientY
    } else if (event instanceof TouchEvent) {
      if (event.touches.length > 0) {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else {
        return null
      }
    } else {
      return null
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  private drawLine(from: { x: number, y: number }, to: { x: number, y: number }): void {
    this.graphics.setStrokeStyle({ width: this.brushSize, color: this.brushColor })
    this.graphics.moveTo(from.x, from.y)
    this.graphics.lineTo(to.x, to.y)
  }

  public clear(): void {
    this.graphics.clear()
  }

  public setBrushSize(size: number): void {
    this.brushSize = size
  }

  public setBrushColor(color: number): void {
    this.brushColor = color
  }

  public getGraphics(): Graphics {
    return this.graphics
  }
}
