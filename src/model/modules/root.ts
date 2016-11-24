import { combineReducers } from "redux"
import { combineEpics } from "redux-observable"
import { requestUrlEpic, schedule, CalendarsState } from "./calendars"
import { tree, TreeState, toggleEpic } from "./tree"
import { errors, ErrorsState, errorsEpic } from "./errors"
import { Api } from "model"

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
}

export const rootReducer = combineReducers<State>({
  errors,
  schedule,
  tree,
})
