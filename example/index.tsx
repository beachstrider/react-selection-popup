import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import ReactSelectionPopup, { PopupHandle } from '../src'

const App = () => {
  const ref = useRef<PopupHandle>(null)

  return (
    <div style={{ padding: 20 }}>
      <ReactSelectionPopup
        ref={ref}
        selectionClassName="selection"
        multipleSelection={false}
        offsetToTop={5}
        metaAttrName="data-meta"
        onSelect={(text, meta) => console.debug(text, meta)}
        onClose={() => false}
      >
        <div style={{ background: 'yellow' }}>
          Sample Popup
          <button
            onClick={() => {
              ref.current?.close()
            }}
          >
            Click Me
          </button>
        </div>
      </ReactSelectionPopup>
      <p className="selection" data-meta={JSON.stringify({ explain: 'Test text' })}>
        Select some text to see the popup.
      </p>
    </div>
  )
}

const container = document.getElementById('root') as Element
const root = ReactDOM.createRoot(container)

root.render(<App />)
