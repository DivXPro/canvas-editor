import { DNode } from '../../elements/DNode'

export interface IMutationElementEventData {
  //事件发生的数据源
  source?: DNode | DNode[] | null
  //事件发生的目标对象
  target?: DNode | DNode[] | null
  // 事件发生的来源对象
  originSourceParents?: DNode | DNode[] | null
  //扩展数据
  extra?: any
}

export class AbstractMutationElementEvent {
  data: IMutationElementEventData
  context: any
  constructor(data: IMutationElementEventData) {
    this.data = data
  }
}
