import { Container, Graphics } from 'pixi.js'

import { Engine } from '../Engine'
import * as UICfg from '../config'

export class ControlBox extends Container {
  private engine: Engine
  private border: Graphics
  private handles: Graphics[]

  constructor(engine: Engine) {
    super()
    this.engine = engine
    this.border = new Graphics()
    this.handles = []
    this.visible = false
    this.initBorder()
    this.initHandles()

    this.engine.events.on('element:select', this.handleSelectChange.bind(this))
    this.engine.events.on('element:unselect', this.handleSelectChange.bind(this))
    this.engine.events.on('drag:move', this.hide.bind(this))
    this.engine.events.on('drag:stop', this.show.bind(this))
  }

  private initBorder() {
    this.addChild(this.border)
  }

  private initHandles() {
    // 4个控制点：左上、右上、右下、左下
    for (let i = 0; i < 4; i++) {
      const handle = new Graphics()
        .rect(0, 0, UICfg.boundingHandingSize, UICfg.boundingHandingSize)
        .fill({
          color: UICfg.white,
        })
        .stroke({
          width: UICfg.boundingHandingStrokeWidth,
          color: UICfg.boundingHandingStrokeColor,
        })

      this.handles.push(handle)
      this.addChild(handle)
    }
  }

  get selection() {
    return this.engine.operation?.selection
  }

  update() {
    if (this.selection == null) {
      return
    }
    const rect = this.selection?.selectedRectPoints

    this.border
      .clear()
      .moveTo(rect[0].x, rect[0].y)
      .lineTo(rect[1].x, rect[1].y)
      .lineTo(rect[2].x, rect[2].y)
      .lineTo(rect[3].x, rect[3].y)
      .lineTo(rect[0].x, rect[0].y)
      .closePath()
      .stroke({ color: UICfg.primaryColor, width: UICfg.boundingBoxWidth })
      .fill({ color: UICfg.white, alpha: 0.5 })

    this.handles.forEach((handle, i) => {
      handle.position.set(rect[i].x - UICfg.boundingHandingSize / 2, rect[i].y - UICfg.boundingHandingSize / 2)
    })
  }

  handleSelectChange() {
    if (this.selection == null || this.selection.length === 0) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    this.update()
    this.visible = true
  }

  hide() {
    this.visible = false
  }

  destroy() {
    this.parent.removeChild(this)
    super.destroy()
  }
}
