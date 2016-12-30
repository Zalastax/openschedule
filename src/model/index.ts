import { IcsEntry } from 'ical/ical.js'
import { Interval } from 'node-interval-tree'
export { State } from './modules/root'
export { TREE_TOGGLE, TreeToggle } from './modules/tree'
export { FILE_LOAD, REQUEST_URL, SELECTION_CHANGE, CalendarsState } from './modules/calendars'
export { WEEK_OFFSET } from './modules/date'
export { Api } from './api'

export interface IcsInterval extends IcsEntry, Interval {
  source: URL
}

export type URL = string

export interface SelectionChange {
  name: string
  value: boolean
}
