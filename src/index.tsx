import "core-js/fn/object/values"

import * as React from "react"
import * as ReactDOM from "react-dom"
import * as moment from "moment"

import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/map"
import { ajax } from "rxjs/observable/dom/ajax.js"
import { AjaxResponse } from "rxjs/observable/dom/AjaxObservable.js"

import { parseICS, Ics, IcsEntry } from "ical/ical.js"
import { IntervalTree } from "node-interval-tree"

import "./index.styl"

import { CalendarWeek, IcsInterval } from "./components/calendar-week"
import CalendarInput from "./components/input"

interface OutState {
  calendars: { [key: string]: IcsInterval[] }
  tree: IntervalTree<IcsInterval>
}

class Out extends React.Component<void, OutState> {

  private onURL: Subject<string>

  constructor(props?: void, context?: any) {
    super(props, context)
    this.state = {
      calendars: {},
      tree: new IntervalTree<IcsInterval>()
    }

    this.onURL = new Subject<String>()
    this.hookOnURL()
  }

  public render() {
    return (
      <div>
        <CalendarInput onGo={this.onURL} />
        <CalendarWeek intervals={this.state.tree} />
      </div>
    )
  }

  private hookOnURL() {
    this.onURL.mergeMap(url =>
      ajax({
        url: `${SERVER_URL}/proxy/${encodeURIComponent(url)}`,
        crossDomain: true,
        responseType: "text",
      })
      .map((x): [AjaxResponse, string] => [x, url])
    )
    .map(([response, url]): [IcsInterval[], string] => {
      const ics = parseICS(response.response)
      const intervals = Object.values(ics)
        .map((value: IcsEntry): IcsInterval =>
          Object.assign({ low: +moment(value.start), high: +moment(value.end) }, value)
        )

      return [intervals, url]
    })
    .subscribe({
      next: ([intervals, url]) => {
        const tree = this.state.tree
        intervals.forEach(value => tree.insert(value))

        const oldCals = this.state.calendars
        const newCals = Object.assign({}, oldCals, { [url]: intervals })

        this.setState({
          calendars: newCals,
          tree,
        })
      },
    })
  }
}

ReactDOM.render(
  <Out />,
  document.getElementById("content") as HTMLElement
)
