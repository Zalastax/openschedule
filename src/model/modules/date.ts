import { Action as ReduxAction } from 'redux'

import actionCreator, { isType } from './actionCreator'

export interface DateState {
  offset: number
}

export const WEEK_OFFSET = actionCreator<number>('WEEK_OFFSET')

// =============================================================================
// Reducer
// =============================================================================

const defaultState = {
  offset: 0,
}

export const date = (state = defaultState, action: ReduxAction): DateState => {
  if (isType(action, WEEK_OFFSET)) {
    return {
      offset: action.payload,
    }
  }
  return state
}
