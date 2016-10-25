import { combineReducers } from "redux"
import { combineEpics } from "redux-observable"
import { requestUrlEpic, schedule, CalendarsState } from "./calendars"
import { tree, TreeState, toggleEpic } from "./tree"
import { errors, ErrorsState, errorsEpic } from "./errors"

export const rootEpic = combineEpics(
  errorsEpic,
  requestUrlEpic,
  toggleEpic
)

export interface State {
  schedule: CalendarsState
  tree: TreeState
  errors: ErrorsState
}

export const rootReducer = combineReducers<State>({
  errors,
  schedule,
  tree,
})
