import { Action } from 'redux'
import { combineEpics } from 'redux-observable'

import { Api } from 'model'
import { CalendarsState, requestUrlEpic, fileLoadEpic, schedule } from './calendars'
import { date, DateState } from './date'
import { errors, errorsEpic, ErrorsState } from './errors'
import { toggleEpic, tree, TreeState } from './tree'
import { search, SearchState } from './search'

const api = new Api()

export const rootEpic = combineEpics(
  errorsEpic,
  requestUrlEpic(api),
  fileLoadEpic,
  toggleEpic,
)

export interface State {
  schedule: CalendarsState
  tree: TreeState
  errors: ErrorsState
  date: DateState
  search: SearchState
}

export function rootReducer(state: State, action: Action): State {
  return {
    errors: errors(state.errors, action),
    schedule: schedule(state.schedule, action),
    tree: tree(state.tree, action),
    date: date(state.date, action),
    search: search(state.search, action, state),
  }
}
