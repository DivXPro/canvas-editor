import { Container } from 'pixi.js'

import { SelectionAreaMoveEvent } from '../events'
import { Engine } from '../models'

import { SelectionArea } from './SelectionArea'

export class SelectionAreaLayer extends Container {
  private engine: Engine
  private selectionArea: SelectionArea | null = null

  constructor(engine: Engine) {
    super()
    this.engine = engine

    // 监听选区事件
    this.engine.events.on('selection:start', this.onSelectionStart)
    this.engine.events.on('selection:move', this.onSelectionMove)
    this.engine.events.on('selection:end', this.onSelectionEnd)
  }

  private onSelectionStart = () => {
    const startPoint = this.engine.workbench.selection.startPoint

    // 创建新的选区
    this.selectionArea = new SelectionArea({ x: startPoint.offsetX, y: startPoint.offsetY })
    this.addChild(this.selectionArea)
  }

  private onSelectionMove = (event: SelectionAreaMoveEvent) => {
    if (!this.selectionArea) return
    const startPoint = this.engine.workbench.selection.startPoint

    // 更新选区大小
    this.selectionArea.update(
      { x: startPoint.offsetX, y: startPoint.offsetY },
      { x: event.data.offsetX, y: event.data.offsetY }
    )
  }

  private onSelectionEnd = () => {
    if (!this.selectionArea) return

    // 清理选区
    this.selectionArea.destroy()
    this.selectionArea = null
  }

  destroy() {
    this.engine.events.off('selectionStart', this.onSelectionStart)
    this.engine.events.off('selectionMove', this.onSelectionMove)
    this.engine.events.off('selectionEnd', this.onSelectionEnd)
    super.destroy()
  }
}
