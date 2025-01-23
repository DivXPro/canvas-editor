import { ICustomEvent } from '../event'

import { AbstractCursorEvent } from './AbstractCursorEvent'

export class DragStopEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'drag:stop'
}
