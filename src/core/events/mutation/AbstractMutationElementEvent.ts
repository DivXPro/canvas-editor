import { DNode } from '../../nodes/DNode'

export interface IMutatioNodeEventData {
  //事件发生的数据源
  source?: DNode | DNode[] | null
  //事件发生的目标对象
  target?: DNode | DNode[] | null
  // 事件发生的来源对象
  originSourceParents?: DNode | DNode[] | null
}

export class AbstractMutationNodeEvent<Data extends IMutatioNodeEventData = IMutatioNodeEventData> {
  data: Data
  context: any
  constructor(data: Data) {
    this.data = data
  }
}
