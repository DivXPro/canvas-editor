import { DElement } from '../../elements/DElement'

export interface IMutationElementEventData {
  //事件发生的数据源
  source?: DElement | DElement[] | null
  //事件发生的目标对象
  target?: DElement | DElement[] | null
  // 事件发生的来源对象
  originSourceParents?: DElement | DElement[] | null
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
