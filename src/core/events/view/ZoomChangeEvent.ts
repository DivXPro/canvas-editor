import { Position } from '../../nodes'
import { ICustomEvent } from '../event'

import { AbstractViewChangeEvent, IViewChangeEventData } from './AbstractViewChangeEvent'

export interface IZoomChangeEventData extends IViewChangeEventData {
  zoomRatio: number
}

export interface IViewhangeEventData extends IViewChangeEventData {
  position: Position
}

export class ZoomChangeEvent extends AbstractViewChangeEvent<IZoomChangeEventData> implements ICustomEvent {
  type = 'zoom:change'
}

export class ViewChangeEvent extends AbstractViewChangeEvent<IViewhangeEventData> implements ICustomEvent {
  type = 'view:change'
}
