import { combineReducers } from "redux"
import { combineEpics } from "redux-observable"
import { requestUrlEpic, schedule, CalendarsState } from "./calendars"
import { tree, TreeState, toggleEpic } from "./tree"

export const rootEpic = combineEpics(
  requestUrlEpic,
  toggleEpic
)

export interface State {
  schedule: CalendarsState
  tree: TreeState
}

export const rootReducer = combineReducers<State>({
  schedule,
  tree,
})
