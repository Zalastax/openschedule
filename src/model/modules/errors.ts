import { Action as ReduxAction, MiddlewareAPI } from 'redux'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs'

import {
  State,
} from 'model'
import actionCreator, { Action, isType } from './actionCreator'

export interface ErrorsState {
  latestError?: string,
}

export const NEW_ERROR = actionCreator<string>('NEW_ERROR')
export const ERROR_TIMEOUT = actionCreator('ERROR_TIMEOUT')
// Add to this object to add more error translations
export const errorTranslators: ET = {}

interface ET {
  [key: string]: (x: ReduxAction) => string | undefined
}

// =============================================================================
// Epics
// =============================================================================

export const errorsEpic = (action$: ActionsObservable<ReduxAction>, _store: MiddlewareAPI<State>) => {
  const real = action$
  .map<ReduxAction, Action<string> | Action<undefined> | undefined>(x => {
    const f = errorTranslators[x.type]
    if (f !== undefined) {
      const fx = f(x)
      if (fx !== undefined) {
        return NEW_ERROR(fx)
      }
    }
  })
  .filterUndefined()

  return real.publish(_real => Observable.merge(
  _real,
  _real.switchMapTo(
    Observable.of(ERROR_TIMEOUT()).delay(5000),
  )))
}

// =============================================================================
// Reducer
// =============================================================================

export const errors = (state = {}, action: ReduxAction): ErrorsState => {
  if (isType(action, NEW_ERROR)) {
    return {
      latestError: action.payload,
    }
  }
  if (isType(action, ERROR_TIMEOUT)) {
    return {
      latestError: undefined,
    }
  }
  return state
}
