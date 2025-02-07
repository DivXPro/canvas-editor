import { Container, PointData } from 'pixi.js'

import { SelectionAreaEndEvent, SelectionAreaMoveEvent, SelectionAreaStartEvent } from '../events'
import { Engine } from '../Engine'

import { SelectionArea } from './SelectionArea'

export class SelectionAreaLayer extends Container {
  private engine: Engine
  private selectionArea: SelectionArea | null = null
  private isSelecting: boolean = false
  private startPoint: PointData | null = null

  constructor(engine: Engine) {
    super()
    this.engine = engine

    // 监听选区事件
    this.engine.events.on('selection:start', this.onSelectionStart.bind(this))
    this.engine.events.on('selection:move', this.onSelectionMove.bind(this))
    this.engine.events.on('selection:end', this.onSelectionEnd.bind(this))
  }

  private onSelectionStart(event: SelectionAreaStartEvent) {
    this.isSelecting = true
    this.startPoint = {
      x: event.data.canvasX,
      y: event.data.canvasY,
    }

    console.log('onSelectionStart', this.startPoint)

    // 创建新的选区
    this.selectionArea = new SelectionArea(this.startPoint)

    this.addChild(this.selectionArea)
  }

  private onSelectionMove(event: SelectionAreaMoveEvent) {
    if (!this.isSelecting || !this.startPoint || !this.selectionArea) return

    // 更新选区大小
    this.selectionArea.update(event.data.canvasX, event.data.canvasY)
    console.log('this.selectionArea', this.selectionArea)
  }

  private onSelectionEnd(event: SelectionAreaEndEvent) {
    if (!this.isSelecting || !this.startPoint || !this.selectionArea) return

    this.isSelecting = false
    this.startPoint = null

    // 清理选区
    this.selectionArea.destroy()
    this.selectionArea = null
  }

  destroy() {
    this.engine.events.off('selectionStart', this.onSelectionStart.bind(this))
    this.engine.events.off('selectionMove', this.onSelectionMove.bind(this))
    this.engine.events.off('selectionEnd', this.onSelectionEnd.bind(this))
    super.destroy()
  }
}
