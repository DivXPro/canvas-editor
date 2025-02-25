import { makeObservable, override } from 'mobx'
import { Container } from 'pixi.js'

import { Engine } from '../models/Engine'
import { ColorUtils } from '../utils/styles'

import { EasingType, LayoutConstraint, NodeType, Paint, Path, Size, StylesObject, Transform, Vector } from './type'
import { DNode, IDNode } from './DNode'

export interface IDVectorBase extends Omit<Vector, 'type'> {
  locked?: boolean
  type: NodeType
}

export type TDVector = IDNode<Container> & Omit<IDVectorBase, 'parent'>

export abstract class DVector<Item extends Container> extends DNode implements TDVector {
  static DEFAULT_FILL: Paint = { type: 'SOLID', color: ColorUtils.numberToRGBA(0xd9d9d9) }

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

  constructor(engine: Engine, options: IDVectorBase) {
    super(engine, options)
    makeObservable(this, {
      serialize: override,
    })
  }

  serialize() {
    return {
      ...super.serialize(),
      constraints: { ...this.constraints },
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
