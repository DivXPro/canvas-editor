import { ViewChangeEvent, ZoomChangeEvent } from '../events'
import { Engine } from '../models'

export const enableZoomEffect = (engine: Engine) => {
  engine.events.on('zoom:change', (event: ZoomChangeEvent) => {
    engine.workspace.canvaNodes.forEach(node => node.setScale(event.data.zoomRatio))
  })

  engine.events.on('view:change', (event: ViewChangeEvent) => {
    engine.app.stage.position.set(event.data.position.x, event.data.position.y)
  })
}
