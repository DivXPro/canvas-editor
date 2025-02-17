import { ICustomEvent } from '../event'

import { AbstractViewChangeEvent, IViewChangeEventData } from './AbstractViewChangeEvent'

export interface IZoomChangeEventData extends IViewChangeEventData {
  zoomRatio: number
}

export class ZoomChangeEvent extends AbstractViewChangeEvent<IZoomChangeEventData> implements ICustomEvent {
  type = 'zoom:change'
}
