import { AppStore } from '@/types/store'
import { useRef } from 'react'
import { useSelector } from 'react-redux'

interface HoverIndicatorGridProps {
  className?: string
  indicatorClassName?: string
  children?: any
  cols: number
  rows: number
  divider?: boolean
}

export default function HoverIndicatorGrid({
  className = '',
  indicatorClassName = '',
  children = null,
  rows = 1,
  cols = 1,
}: HoverIndicatorGridProps) {
  const container = useRef<HTMLDivElement>(null)
  const indicator = useRef<HTMLDivElement>(null)
  const theme = useSelector((store: AppStore) => store.theme.theme)

  const handleMove = (e: any) => {
    if (!indicator.current || !container.current) {
      return
    }
    const menuRect = container.current.getBoundingClientRect()
    const left = e.pageX - menuRect.left
    const top = e.pageY - menuRect.top
    const width = menuRect.width
    const height = menuRect.height

    const indicatorW = width / cols
    const indicatorH = height / rows

    const indicatorLeft = Math.floor(left / indicatorW) * indicatorW
    const indicatorTop = Math.floor(top / indicatorH) * indicatorH

    // Ensure the indicator stays within the bounds
    indicator.current.style.width = `${indicatorW}px`
    indicator.current.style.height = `${indicatorH}px`
    indicator.current.style.left = `${Math.min(indicatorLeft, width - indicatorW)}px`
    indicator.current.style.top = `${Math.min(indicatorTop, height - indicatorH)}px`
  }

  const handleLeave = () => {
    if (!indicator.current || !container.current) {
      return
    }
    indicator.current.style.opacity = '0'
  }

  const handleEnter = () => {
    if (!indicator.current || !container.current) {
      return
    }
    indicator.current.style.opacity = '1'
  }

  return (
    <div
      ref={container}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={'relative h-full w-full' + ` ${className}`}
    >
      <div
        className={
          'pointer-events-none absolute w-0 rounded-[6px] bg-[#f9f9f9] opacity-0 transition-all duration-200 dark:bg-[#141414]' +
          ` ${indicatorClassName}`
        }
        ref={indicator}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
