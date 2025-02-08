import { makeObservable, override } from 'mobx'
import { Container } from 'pixi.js'

import { Engine } from '../Engine'

import { DNode, IDNode } from './DNode'
import { Color, EasingType, LayoutConstraint, NodeType, Path, Size, StylesObject, Transform, Vector } from './type'
import { ColorUtils } from '../utils/styles'

export interface IDVectorBase extends Omit<Vector, 'type'> {
  locked?: boolean
  index?: number
}

export type TDVector = IDNode<Container> & IDVectorBase

export interface DVectorOptions extends Omit<IDVectorBase, 'type'> {
  engine: Engine
  parent?: DNode
  size?: Size
  type: NodeType
}

export abstract class DVector<Item extends Container> extends DNode implements TDVector {
  static DEFAULT_COLOR: Color = ColorUtils.numberToRGBA(0xfcfcfc)

  declare _size: Size
  declare item: Item
  preserveRatio?: boolean | undefined
  constraints: LayoutConstraint = {
    vertical: 'TOP',
    horizontal: 'LEFT',
  }
  transitionNodeID?: string | null | undefined
  transitionDuration?: number | null | undefined
  transitionEasing?: EasingType | null | undefined
  opacity?: number | undefined
  relativeTransform?: Transform | undefined
  fillGeometry?: Path[] | undefined
  strokeGeometry?: Path[] | undefined
  styles?: StylesObject | undefined

  constructor(options: DVectorOptions) {
    super(options)
    makeObservable(this, {
      jsonData: override,
      globalCenter: override,
    })
  }

  get globalCenter() {
    return {
      x: this.globalPosition.x,
      y: this.globalPosition.y,
    }
  }

  get jsonData() {
    return {
      ...super.jsonData,
      constraints: this.constraints,
      preserveRatio: this.preserveRatio,
      transitionNodeID: this.transitionNodeID,
      transitionDuration: this.transitionDuration,
      transitionEasing: this.transitionEasing,
      opacity: this.opacity,
      relativeTransform: this.relativeTransform,
      fillGeometry: this.fillGeometry,
      strokeGeometry: this.strokeGeometry,
      styles: this.styles,
    }
  }
}
