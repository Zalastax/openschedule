import { combineReducers } from "redux"
import { combineEpics } from "redux-observable"
import { requestUrlEpic, schedule, CalendarsState } from "./calendars"
import { tree, TreeState, toggleEpic } from "./tree"
import { errors, ErrorsState, errorsEpic } from "./errors"
import { Api } from "model"
import { date, DateState } from './date'

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
