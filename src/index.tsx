import './setup'
import { hotwrap } from './hot'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import configureStore from 'model/configureStore'
import { Provider } from 'react-redux'

import Root from 'components/root'

import './index.styl'

const store = configureStore({})

function render<T>(component: React.ReactElement<T>) {
  ReactDOM.render(hotwrap(
    <Provider store={store}>
      {component}
  </Provider>),
    document.getElementById('content') as HTMLElement,
  )
}

render(<Root />)

if (process.env.HOT) {
  (module as any).hot.accept('components/root', () => {
    render(React.createElement(require('components/root').default))
  })
}
