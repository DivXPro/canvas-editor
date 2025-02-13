import { Container, ContainerOptions } from 'pixi.js'

export interface GroupOptions extends ContainerOptions { }

export class Group extends Container {
  constructor(options: GroupOptions) {
    super(options)
  }
}
