import React, { useEffect, useRef, useState } from 'react'

interface ReactSelectionPopupProps {
  /**
   * This function is called when a user selects texts in html.
   * @param text - The text of the selection
   * @param meta - Additional metadata associated with the selected text (optional)
   */
  onSelect?: (text: string, meta?: string | number | boolean | object) => void
  /**
   * This function is called when a popup is closed due to focus lost.
   */
  onClose?: () => void
  /**
   * The child elements to be displayed within the popup component.
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
  /**
   * The rest properties.
   */
  [key: string]: any
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

const ReactSelectionPopup = ({
  onSelect,
  onClose,
  children,
  selectionClassName,
  multipleSelection = true,
  metaAttrName,
  offsetToLeft = 0,
  offsetToTop = 0,
  ...rest
}: ReactSelectionPopupProps) => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const [position, setPosition] = useState<Position | null>(null)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.addEventListener('mouseup', (e: any) => {
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
            }
          }
        }

        setPosition(null)
      }
    })

    window.addEventListener('mousedown', (e) => {
      const selection = window.getSelection()

      let node: HTMLElement | null = e.target as HTMLElement

      // Check if the target div is popup which is the exception case
      while (node != null) {
        if (node === ref.current) {
          return
        }

        node = node.parentNode as HTMLElement
      }

      if (selection !== null) {
        selection.removeAllRanges()
      }

      setPosition(null)
      onClose?.()
    })

    window.addEventListener('scroll', () => {
      setPosition(null)
      onClose?.()
    })
  }, [onSelect, onClose, multipleSelection, selectionClassName, metaAttrName])

  useEffect(() => {
    if (ref.current) {
      const width = ref.current.offsetWidth
      const height = ref.current.offsetHeight

      setSize({ width, height })
    }
  }, [children, position])

  if (position === null) return <></>

  const left = position.x - size.width - offsetToLeft
  const top = position.y - size.height - offsetToTop

  return (
    <div style={{ position: 'fixed', left, top }}>
      <div ref={ref} {...rest}>
        {children}
      </div>
    </div>
  )
}

export default ReactSelectionPopup
