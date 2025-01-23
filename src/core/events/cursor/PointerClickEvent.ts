import { ICustomEvent } from '../event'

import { AbstractCursorEvent } from './AbstractCursorEvent'

export class PointerClickEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'mouse:click'
}

export class PointerDoubleClickEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'pointer:dblclick'
}
