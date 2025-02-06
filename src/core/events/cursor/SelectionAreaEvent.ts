import { ICustomEvent } from '../event'

import { AbstractCursorEvent } from './AbstractCursorEvent'

export class SelectionAreaStartEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'selection:start'
}

export class SelectionAreaMoveEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'selection:move'
}

export class SelectionAreaEndEvent extends AbstractCursorEvent implements ICustomEvent {
  type = 'selection:end'
}
