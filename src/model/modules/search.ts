import { Action as ReduxAction } from 'redux'
import * as moment from 'moment'
import uniqBy from 'lodash/uniqBy'

import {
  IcsInterval,
  State,
  WEEK_OFFSET,
} from 'model'
import actionCreator, { isType } from './actionCreator'

import { ScoreIntervalSplit, score, IntervalSplit, fillEmpty, flatten, ScoreCheckpoint } from 'util/interval'

const currentWeekStart = moment().startOf('week')

export interface SearchState {
  result: ScoreCheckpoint[]
  maxCheckpointScore: number
}

export const SEARCH = actionCreator<number>('SEARCH')

// =============================================================================
// Reducer
// =============================================================================

const defaultState = {
  result: [],
  maxCheckpointScore: 0,
}

function scoreIntervalSplit(interval: IntervalSplit<IcsInterval>): ScoreIntervalSplit<IcsInterval> {
  const uniqueCount = uniqBy(interval.overlapping, v => v.source).length

  return {
    score: uniqueCount,
    low: interval.low,
    high: interval.high,
    overlapping: interval.overlapping,
  }
}

export const search = (state: SearchState = defaultState, action: ReduxAction, wholeState: State): SearchState => {
  if (isType(action, SEARCH)) {
    const minutes = action.payload
    const ms = minutes * 60 * 1000
    const weekStart = moment(currentWeekStart).add(wholeState.date.offset, 'week')
    const weekEnd = moment(weekStart).endOf('week')

    const splits = fillEmpty(
      flatten(wholeState.tree.tree, +weekStart, +weekEnd),
      +weekStart,
      +weekEnd)

    const intervals = splits.map(scoreIntervalSplit)

    const maxIntervalScore =  wholeState.schedule.selected.length

    return {
      result: score(intervals, ms),
      maxCheckpointScore: ms * maxIntervalScore,
    }
  }

  if (isType(action, WEEK_OFFSET)) {
    return defaultState
  }

  return state
}
