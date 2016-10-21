import { IcsEntry } from "ical/ical.js"
import { Interval } from "node-interval-tree"
export { State } from "./modules/root"

export interface IcsInterval extends IcsEntry, Interval {}

export type URL = string

export interface SelectionChange {
  name: string
  value: boolean
}
