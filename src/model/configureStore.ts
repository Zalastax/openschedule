import { applyMiddleware, compose, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'

import { rootEpic, rootReducer } from './modules/root'

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(initialState: any) {
  const composers = [
    applyMiddleware(createEpicMiddleware(rootEpic)),
  ]

  return createStore(rootReducer, initialState, composeEnhancers(...composers))
}
