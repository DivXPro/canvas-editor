import { Engine } from '../models'
import { KeyDownEvent, KeyUpEvent } from '../events'

export const enableKeyboardEffect = (engine: Engine) => {
  engine.subscribeTo(KeyDownEvent.Type, event => {
    const keyboard = engine.keyboard

    if (!keyboard) return
    const workbench = engine.workbench

    keyboard.handleKeyboard(event, workbench.getEventContext())
  })

  engine.subscribeTo(KeyUpEvent.Type, event => {
    const keyboard = engine.keyboard

    if (!keyboard) return
    const workbench = engine.workbench

    keyboard.handleKeyboard(event, workbench.getEventContext())
  })
}
