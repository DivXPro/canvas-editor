export interface ICustomEvent<EventData = any, EventContext = any> {
  type: string
  data?: EventData
  context?: EventContext
}
export interface CustomEventClass {
  new(...args: any[]): any
}
