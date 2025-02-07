import { useEffect, useRef } from 'react'
import { Assets, Sprite, Texture } from 'pixi.js'

import DefaultLayout from '@/layouts/default'
import { IDRectangle, IDText } from '@/core/elements'
import { Engine } from '../core/Engine'

export default function IndexPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initApp = async () => {
      const engine = new Engine()

      if (containerRef.current) {
        await engine.init({
          background: 0xdfdfdf,
          resizeTo: containerRef.current,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          enableZoom: true,
          data: {
            id: 'app-1',
            name: 'app-1',
            frame: {
              x: 100,
              y: 100,
              width: 512,
              height: 512,
              type: 'Frame',
              items: [
                {
                  id: 'rectangle-1',
                  name: 'Rectangle 1',
                  type: 'Rectangle',
                  x: 50,
                  y: 50,
                  width: 50,
                  height: 50,
                  radius: 20,
                  rotation: Math.PI / 4,
                  fillStyle: { color: 'orange' },
                } as IDRectangle,
                {
                  id: 'text-1',
                  name: 'Text 1',
                  type: 'Text',
                  x: 100,
                  y: 100,
                  width: 150,
                  height: 100,
                  fixSize: true,
                  text: 'This is text of example 1',
                  style: { fill: { color: 'orange' }, align: 'center' },
                } as IDText,
                {
                  id: 'text-2',
                  name: 'Text 2',
                  type: 'Text',
                  x: 100,
                  y: 200,
                  width: 150,
                  height: 100,
                  fixSize: true,
                  text: 'This is text of example 2',
                  style: { fill: { color: 'pink' }, align: 'left' },
                } as IDText,
                {
                  id: 'text-3',
                  name: 'Text 3',
                  type: 'Text',
                  x: 100,
                  y: 300,
                  width: 150,
                  height: 100,
                  fixSize: true,
                  locked: true,
                  text: 'This is text of example 3 locked',
                  style: { fill: { color: 'pink' }, align: 'right' },
                } as IDText,
              ],
            },
          },
        })
      }

      if (containerRef.current) {
        containerRef.current.appendChild(engine.app.canvas)
      }

      // 加载资源
      const original = await Assets.load<Texture>('/original.png')
      // const initMaskTexture = await Assets.load<Texture>('/assets/mask.png')

      const originalPreview = new Sprite(original)
      // const maskGraphics = drawMask(initMaskTexture)

      originalPreview.scale.set(0.5)
      originalPreview.anchor.set(0.5)
    }

    initApp()
  }, [])

  return (
    <DefaultLayout>
      <div ref={containerRef} className="h-full" id="canvas" />
    </DefaultLayout>
  )
}
