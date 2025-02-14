import { ICustomEvent } from '../event'

import { AbstractCursorEvent } from './AbstractCursorEvent'

export class RotateMoveEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'rotate:move'
}
