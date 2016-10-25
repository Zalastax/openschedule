import { Action as ReduxAction, MiddlewareAPI } from "redux"
import {
  State,
} from "model"
import actionCreator, { isType, Action } from "redux-typescript-actions"
import { ActionsObservable } from "redux-observable"

export interface ErrorsState {
  latestError?: string,
}

export const NEW_ERROR = actionCreator<string>("NEW_ERROR")

interface ET {
  [key: string]: (x: ReduxAction) => string | undefined
}


// Add to this object to add more error translations
export const errorTranslators: ET = {}

export const errorsEpic = (action$: ActionsObservable<ReduxAction>, store: MiddlewareAPI<State>) =>
  action$
  .map<ReduxAction, Action<string> | undefined>(x => {
    const f = errorTranslators[x.type]
    if (f !== undefined) {
      const fx = f(x)
      if (fx !== undefined) {
        return NEW_ERROR(fx)
      }
    }
  })
  .filterUndefined()


export const errors = (state = {}, action: ReduxAction): ErrorsState => {
  if (isType(action, NEW_ERROR)) {
    return {
      latestError: action.payload,
    }
  }
  return state
}
