import { IcsEntry } from "ical/ical.js"
import { Interval } from "node-interval-tree"
export { State } from "./modules/root"
export { TREE_TOGGLE } from "./modules/tree"
export { REQUEST_URL, SELECTION_CHANGE, CalendarsState } from "./modules/calendars"

export interface IcsInterval extends IcsEntry, Interval {}

export type URL = string

export interface SelectionChange {
  name: string
  value: boolean
}
