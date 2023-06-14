import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import ReactSelectionPopup, { HandleRef } from '../src'

const App = () => {
  const ref = useRef<HandleRef>(null)

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
        <div style={{ background: 'yellow', display: 'flex', gap: 20 }}>
          <div>Sample Popup</div>
          <button
            onClick={() => {
              ref.current?.close()
            }}
          >
            Click Me
          </button>
        </div>
      </ReactSelectionPopup>
      <div>
        <div>
          <div>
            <p className="selection" data-meta={JSON.stringify({ explain: 'Test text' })}>
              Select some text to see the popup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('root') as Element
const root = ReactDOM.createRoot(container)

root.render(<App />)
