import { combineReducers } from 'redux'
import { combineEpics } from 'redux-observable'

import { Api } from 'model'
import { CalendarsState, requestUrlEpic, schedule } from './calendars'
import { date, DateState } from './date'
import { errors, errorsEpic, ErrorsState } from './errors'
import { toggleEpic, tree, TreeState } from './tree'

const api = new Api()

export const rootEpic = combineEpics(
  errorsEpic,
  requestUrlEpic(api),
  toggleEpic,
)

export interface State {
  schedule: CalendarsState
  tree: TreeState
  errors: ErrorsState
  date: DateState
}

export const rootReducer = combineReducers<State>({
  errors,
  schedule,
  tree,
  date,
})
