import { Action as ReduxAction, MiddlewareAPI } from "redux"
import { Observable } from "rxjs"
import { ActionsObservable } from "redux-observable"
import { IcsInterval, URL, SelectionChange, State } from "model"
import { errorTranslators } from "./errors"
import actionCreator, { isType, Action, FailedAction } from "redux-typescript-actions"
import { ajax } from "rxjs/observable/dom/ajax.js"
import { parseICS, IcsEntry } from "ical/ical.js"
import * as moment from "moment"

export interface CalendarsState {
  [key: string]: {
    interval: IcsInterval[],
    selected: boolean,
  }
}

export const REQUEST_URL = actionCreator.async<URL, IcsInterval[], Error>("SCHEDULE_REQUEST_URL")
export const SELECTION_CHANGE = actionCreator<SelectionChange>("SELECTION_CHANGE")

errorTranslators[REQUEST_URL.failed.type] = (x: Action<FailedAction<URL, Error>>) =>
  `Failed to get ${x.payload.params}: ${JSON.stringify(x.payload.error, ["message", "arguments", "type", "name"])}`

function isDayStart(m: moment.Moment): boolean {
  return m.isSame(moment(m).startOf("day"))
}

// =============================================================================
// Epics
// =============================================================================

export const requestUrlEpic = (action$: ActionsObservable<Action<URL>>, store: MiddlewareAPI<State>) =>
  action$
    .ofType(REQUEST_URL.started.type)
    .mergeMap((action: Action<URL>) => {
      if (store.getState().schedule[action.payload]) {
        return Observable.empty()
      }

      return ajax({
        url: `${SERVER_URL}/proxy/${encodeURIComponent(action.payload)}`,
        crossDomain: true,
        responseType: "text",
      })
      .map(response => {
        const ics = parseICS(response.response)
        const result = Object.values(ics)
          .map((value: IcsEntry): IcsInterval => {
            const startMoment = moment(value.start)
            const endMoment = moment(value.end)
            if (startMoment.isSame(endMoment) && isDayStart(startMoment)) {
              // Mutate endMoment to be end of day
              endMoment.endOf("day")
            }

            return Object.assign({ low: +startMoment, high: +endMoment}, value)
            },
          )

        return REQUEST_URL.done({ params: action.payload, result })
      })
      .catch((error: Error) => Observable.of(REQUEST_URL.failed({params: action.payload, error})))

      },
    )

// =============================================================================
// Reducer
// =============================================================================

export const schedule = (state: CalendarsState = { }, action: ReduxAction): CalendarsState => {
  let newState = state
  if (isType(action, REQUEST_URL.done)) {
    const payload = action.payload
    newState = Object.assign({}, newState, {
      [payload.params]: {
        interval: payload.result,
        selected: true,
      },
    })
  } else if (isType(action, SELECTION_CHANGE)) {
    const payload = action.payload
    const interval = state[payload.name].interval
    if (interval) {
      newState = Object.assign({}, newState, {
        [payload.name]: {
          interval,
          selected: payload.value,
        },
      })
    }
  }

  return newState
}
