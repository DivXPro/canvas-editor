import { ICustomEvent } from '../event'

import { AbstractKeyboardEvent } from './AbstractKeyboardEvent'

export class KeyUpEvent extends AbstractKeyboardEvent implements ICustomEvent {
  static Type = 'key:up'
  type = KeyUpEvent.Type
}
