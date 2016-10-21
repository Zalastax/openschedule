import { Action as ReduxAction, MiddlewareAPI } from "redux"
import { Observable } from "rxjs"
import { IcsInterval, State, SelectionChange } from "model"
import actionCreator, { isType, Action } from "redux-typescript-actions"
import { ActionsObservable } from "redux-observable"
import { IntervalTree } from "node-interval-tree"

import { REQUEST_URL } from "./calendars"
import { SELECTION_CHANGE } from "./calendars"

type URL = string

export interface TreeState {
  tree: IntervalTree<IcsInterval>,
  update: number
}

interface FetchedUrl {
  url: URL
  intervals: IcsInterval[]
}

const startState: TreeState = {
  tree: new IntervalTree<IcsInterval>(),
  update: 0,
}

interface TreeToggle {
  on: boolean,
  sc: IcsInterval[],
}

export const TREE_TOGGLE = actionCreator<TreeToggle>("TREE_TOGGLE")

export const toggleEpic = (action$: ActionsObservable<SelectionChange>, store: MiddlewareAPI<State>) =>
  action$
    .ofType(SELECTION_CHANGE.type)
    .map((action: Action<SelectionChange>) => {
      const sc = store.getState().schedule[action.payload.name]
      console.log(sc)
      if (!sc) {
        return
      }
      return TREE_TOGGLE({
        on: action.payload.value,
        sc: sc.interval,
      })
    })
    .filter(x => x !== undefined) as Observable<Action<TreeToggle>>

export const tree = (state = startState, action: ReduxAction): TreeState => {
  let newState = state
  if (isType(action, REQUEST_URL.done)) {
    const payload = action.payload

    payload.result.forEach(value => state.tree.insert(value))

    // copy tree to new object so that redux detects it as a change
    // increase update so that shallow compares can use it
    newState = {
      tree: state.tree,
      update: state.update + 1,
    }
  }
  if (isType(action, TREE_TOGGLE)) {
    const payload = action.payload

    console.log(1, payload)
    if (payload.on) {
      payload.sc.forEach(value => state.tree.insert(value))
    } else {
      payload.sc.forEach(value => state.tree.remove(value))
    }

    // copy tree to new object so that redux detects it as a change
    // increase update so that shallow compares can use it
    newState = {
      tree: state.tree,
      update: state.update + 1,
    }
    console.log(2, newState)
  }

  return newState
}
