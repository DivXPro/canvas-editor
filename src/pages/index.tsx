import { useMemo } from 'react'

import { Engine } from '@/core'
import DefaultLayout from '@/layouts/default'
import { CanvasEditor } from '@/components/canvasEditor'

export default function IndexPage() {
  const engine = useMemo(() => {
    return new Engine()
  }, [])

  return (
    <DefaultLayout>
      <CanvasEditor engine={engine} />
    </DefaultLayout>
  )
}
