import { ICustomEvent } from '../event'

import { AbstractCursorEvent } from './AbstractCursorEvent'

export class PointerMoveEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'pointer:move'
}
