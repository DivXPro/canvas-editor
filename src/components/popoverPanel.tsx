import React, { useEffect, useRef, useState } from 'react'

interface PopoverPanelProps {
  x: number // 弹出位置的 x 坐标
  y: number // 弹出位置的 y 坐标
  children: React.ReactNode
  onClose?: () => void
}

export const PopoverPanel: React.FC<PopoverPanelProps> = ({ x, y, children, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: y, left: x })

  // 调整弹出面板位置，确保不会超出视窗
  useEffect(() => {
    if (panelRef.current) {
      const panel = panelRef.current
      const rect = panel.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newTop = y
      let newLeft = x

      // 检查右边界
      if (x + rect.width > viewportWidth) {
        newLeft = viewportWidth - rect.width
      }

      // 检查下边界
      if (y + rect.height > viewportHeight) {
        newTop = viewportHeight - rect.height
      }

      setPosition({ top: newTop, left: newLeft })
    }
  }, [x, y])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        padding: '8px',
      }}
    >
      {children}
    </div>
  )
}
