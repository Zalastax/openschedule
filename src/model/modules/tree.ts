import {
  IcsInterval,
  FILE_LOAD,
  REQUEST_URL,
  SELECTION_CHANGE,
  SelectionChange,
  State,
} from 'model'
import { IntervalTree } from 'node-interval-tree'
import { Action as ReduxAction, MiddlewareAPI } from 'redux'
import { ActionsObservable } from 'redux-observable'
import actionCreator, { Action, isType } from './actionCreator'

export interface TreeState {
  tree: IntervalTree<IcsInterval>,
  update: number
}

const startState: TreeState = {
  tree: new IntervalTree<IcsInterval>(),
  update: 0,
}

export interface TreeToggle {
  on: boolean,
  sc: IcsInterval[],
}

export const TREE_TOGGLE = actionCreator<TreeToggle>('TREE_TOGGLE')

// =============================================================================
// Epics
// =============================================================================

export const toggleEpic = (action$: ActionsObservable<SelectionChange>, store: MiddlewareAPI<State>) =>
  action$
    .ofType(SELECTION_CHANGE.type)
    .map((action: Action<SelectionChange>) => {
      const sc = store.getState().schedule.byURL[action.payload.name]
      if (!sc) {
        return
      }
      return TREE_TOGGLE({
        on: action.payload.value,
        sc: sc.intervals,
      })
    })
    .filterUndefined()

// =============================================================================
// Reducer
// =============================================================================

export const tree = (state = startState, action: ReduxAction): TreeState => {
  let newState = state
  if (isType(action, REQUEST_URL.done) || isType(action, FILE_LOAD.done)) {
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
  }

  return newState
}
