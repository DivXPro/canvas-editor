import React, { useEffect, useRef } from 'react'

import { Engine } from '../core/models/Engine'
import { demoData } from '../mock/demo'
import { CanvasEngineContext } from '../context'

import { CanvasMenu } from './canvasMenu'

export const CANVAS_NAME = 'Canvas'

export type CanvasContextValue = {
  engine: Engine | null
}

export interface CanvasProps {
  canvasScope?: any
  engine: Engine
}

export const Canvas: React.FC<CanvasProps> = ({ engine }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initApp = async () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()

        await engine.init({
          background: 0xdfdfdf,
          resizeTo: containerRef.current,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          enableZoom: true,
          data: demoData,
          canvasSize: { width, height },
        })
      }

      if (containerRef.current) {
        containerRef.current.appendChild(engine.app.canvas)
      }
    }

    initApp()
  }, [])

  return (
    <CanvasEngineContext.Provider value={engine}>
      <CanvasMenu>
        <div ref={containerRef} className="h-full" id="canvas" />
      </CanvasMenu>
    </CanvasEngineContext.Provider>
  )
}
