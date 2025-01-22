import { useEffect, useRef } from 'react'
import { Assets, Sprite, Texture } from 'pixi.js'

import DefaultLayout from '@/layouts/default'
import { DesignApplication } from '@/core/DesignApplication'
import { IDRectangle } from '@/core/elements/DRectangle'

export default function IndexPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initApp = async () => {
      const app = new DesignApplication()

      if (containerRef.current) {
        await app.init({
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
              x: 0,
              y: 0,
              width: 512,
              height: 512,
              type: 'Frame',
              items: [
                {
                  id: 'rectangle-1',
                  name: 'Rectangle 1',
                  type: 'Rectangle',
                  x: 150,
                  y: 100,
                  width: 100,
                  height: 100,
                  radius: 20,
                  rotation: Math.PI / 4,
                  graphics: {
                    fillStyle: { color: 'orange' },
                  },
                } as IDRectangle,
              ],
            },
          },
        })
      }

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas)
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
