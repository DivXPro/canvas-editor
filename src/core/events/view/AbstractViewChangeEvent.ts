interface Position {
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  canvasX: number
  canvasY: number
}

export interface IViewChangeEventData extends Partial<Position> { }

export class AbstractViewChangeEvent<Data extends IViewChangeEventData = IViewChangeEventData> {
  data: Data
  context: any

  constructor(data: Data) {
    this.data = data || {
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      canvasX: 0,
      canvasY: 0,
    }
  }
}
