import { IcsEntry, parseICS } from 'ical/ical.js'
import {
  Api,
  IcsInterval,
  SelectionChange,
  State,
  URL,
} from 'model'
import * as moment from 'moment'
import { Action as ReduxAction, MiddlewareAPI } from 'redux'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs'
import actionCreator, { Action, Failure, isType } from './actionCreator'
import { errorTranslators } from './errors'

export interface CalendarsState {
  byURL: {
    [key: string]: {
      intervals: IcsInterval[],
      selected: boolean,
    },
  }
  selected: string[]
}

export const REQUEST_URL = actionCreator.async<URL, IcsInterval[], Error>('SCHEDULE_REQUEST_URL')
export const SELECTION_CHANGE = actionCreator<SelectionChange>('SELECTION_CHANGE')

errorTranslators[REQUEST_URL.failed.type] = (x: Action<Failure<URL, Error>>) =>
  `Failed to get ${x.payload.params}: ${JSON.stringify(x.payload.error, ['message', 'arguments', 'type', 'name'])}`

function isDayStart(m: moment.Moment): boolean {
  return m.isSame(moment(m).startOf('day'))
}

// =============================================================================
// Epics
// =============================================================================

export const requestUrlEpic = (api: Api) => (action$: ActionsObservable<Action<URL>>, store: MiddlewareAPI<State>) =>
  action$
    .ofType(REQUEST_URL.started.type)
    .mergeMap((action: Action<URL>) => {
      const url: URL = action.payload
      if (store.getState().schedule.byURL[url]) {
        return Observable.empty()
      }

      return api.proxy(url)
      .map(response => {
        const ics = parseICS(response.response)
        const result = Object.values(ics)
          .map((value: IcsEntry): IcsInterval => {
            const startMoment = moment(value.start)
            const endMoment = moment(value.end)
            if (startMoment.isSame(endMoment) && isDayStart(startMoment)) {
              // Mutate endMoment to be end of day
              endMoment.endOf('day')
            }

            return Object.assign({ low: +startMoment, high: +endMoment, source: url}, value)
            },
          )

        return REQUEST_URL.done({ params: url, result })
      })
      .catch((error: Error) => Observable.of(REQUEST_URL.failed({params: url, error})))

      },
    )

// =============================================================================
// Reducer
// =============================================================================

const defaultState: CalendarsState = {
  byURL: {},
  selected: [],
}

export const schedule = (state: CalendarsState = defaultState, action: ReduxAction): CalendarsState => {
  let newState = state
  if (isType(action, REQUEST_URL.done)) {
    const payload = action.payload
    const byURL = Object.assign({}, state.byURL, {
      [payload.params]: {
        intervals: payload.result,
        selected: true,
      },
    })
    newState = {
      byURL,
      selected: [...state.selected, payload.params],
    }
  } else if (isType(action, SELECTION_CHANGE)) {
    const payload = action.payload
    const intervals = state.byURL[payload.name].intervals
    if (intervals) {
      const byURL = Object.assign({}, state.byURL, {
        [payload.name]: {
          intervals,
          selected: payload.value,
        },
      })
      let selected = state.selected
      if (payload.value) {
        selected = [...selected, payload.name]
      } else {
        selected = selected.filter(v => v !== payload.name)
      }
      newState = {
        byURL,
        selected,
      }
    }
  }

  return newState
}
