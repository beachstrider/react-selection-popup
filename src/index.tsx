import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

interface ReactSelectionPopupProps {
  /**
   * This function is called when a user selects texts in html.
   * @param text - The text of the selection
   * @param meta - Additional metadata associated with the selected text (optional)
   */
  onSelect?: (text: string, meta?: any) => void
  /**
   * This function is called when a popup is closed due to focus lost.
   */
  onClose?: () => void
  /**
   * This function returns a function to close a popup.
   */
  children: React.ReactNode
  /**
   * The className to be used to identify selectable element(s).
   */
  selectionClassName: string
  /**
   * Whether multiple elements can be selected at once (default is false).
   */
  multipleSelection?: boolean
  /**
   * The name of the metadata attribute associated with the selected text (optional).
   * The metadata value should be JSON stringfied.
   * @example <div ... className="selection" metaAttrName="data-meta">...</div>
   * ...
   * <ReactSelectionPopup ... data-meta={JSON.stringfy(data)}>...</ReactSelectionPopup>
   */
  metaAttrName?: string
  /**
   * The offset (in pixels) to the left direction of the screen to reposition the popup. The default pivot x is right of the pop.
   */
  offsetToLeft?: number
  /**
   * The offset (in pixels) to the top direction of the screen to reposition the popup. The default pivot y is bottom of the pop.
   */
  offsetToTop?: number

  id?: string
  className?: string
  style?: React.CSSProperties
}

type Size = {
  /**
   * The width of the element in pixels.
   */
  width: number
  /**
   * The height of the element in pixels.
   */
  height: number
}

type Position = {
  /**
   * The x-coordinate of the upper-left corner of the element.
   */
  x: number
  /**
   * The y-coordinate of the upper-left corner of the element.
   */
  y: number
}

export interface HandleRef {
  close: () => void
}

const ReactSelectionPopup: React.ForwardRefRenderFunction<HandleRef, ReactSelectionPopupProps> = (
  {
    onSelect,
    onClose,
    children,
    selectionClassName,
    multipleSelection = true,
    metaAttrName,
    offsetToLeft = 0,
    offsetToTop = 0,
    ...rest
  },
  ref
) => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  console.debug('---  size:', size)
  const [position, setPosition] = useState<Position | null>(null)

  const popupRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<Position | null>(null)

  positionRef.current = position

  const isPopupContent = useCallback((e: any) => {
    let node: HTMLElement | null = e.target as HTMLElement

    // Check if the target div is popup which is the exception case
    while (node != null) {
      if (node === popupRef.current) {
        return true
      }

      node = node.parentNode as HTMLElement
    }

    return false
  }, [])

  const close = useCallback(() => {
    setPosition(null)
    onClose?.()
  }, [onClose])

  useEffect(() => {
    const onMouseUp = (e: any) => {
      const selection = window.getSelection()
      if (selection !== null) {
        const { anchorNode, focusNode } = selection

        if (anchorNode !== null && focusNode !== null) {
          if (anchorNode.parentElement !== null && anchorNode.parentElement.classList.contains(selectionClassName)) {
            const text = selection.toString()
            const meta = JSON.parse(e.target.getAttribute(metaAttrName))

            if (text) {
              if (!metaAttrName || meta) {
                if (selection.rangeCount !== 0) {
                  if (anchorNode.isEqualNode(focusNode) || multipleSelection) {
                    const range = selection.getRangeAt(0)

                    const { right: x, top: y } = range.getBoundingClientRect()

                    // TODO: position {x, y} should come from the first line of selection

                    setPosition({ x, y })
                    onSelect?.(text, meta)
                    return
                  } else {
                    selection.removeAllRanges()
                  }
                }
              }

              if (!isPopupContent(e)) {
                close()
              }
            } else {
              setPosition(null)
            }
          }
        }
      }
    }

    const onMousedown = (e: any) => {
      const selection = window.getSelection()

      if (!isPopupContent(e) && positionRef.current !== null && selection !== null) {
        selection.removeAllRanges()
        close()
      }
    }

    const onScroll = () => {
      close()
    }

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousedown', onMousedown)
    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousedown', onMousedown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [close, onSelect, onClose, isPopupContent, position, multipleSelection, selectionClassName, metaAttrName])

  useEffect(() => {
    if (popupRef.current) {
      const width = popupRef.current.offsetWidth
      const height = popupRef.current.offsetHeight

      setSize({ width, height })
    }
  }, [children, position, popupRef])

  useImperativeHandle(ref, (): HandleRef => {
    return {
      close
    }
  })

  if (position === null) return <></>

  const left = position.x - size.width - offsetToLeft
  const top = position.y - size.height - offsetToTop

  return (
    <div style={{ position: 'fixed', left, top, zIndex: 9999 }}>
      <div ref={popupRef} {...rest}>
        {children}
      </div>
    </div>
  )
}

export default React.forwardRef(ReactSelectionPopup)
