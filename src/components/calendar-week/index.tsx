import * as React from "react"
import * as compare from "react-addons-shallow-compare"
import * as moment from "moment"

import { IcsEntry } from "ical/ical.js"

export interface IcsInterval extends IcsEntry, Interval {}


// Set locale to ISO 8601 weeks
moment.updateLocale("en", { week: { dow: 1, doy: 4 } })

import { Interval, IntervalTree } from "node-interval-tree"

import DayHours from "./hours"

import * as CSS from "./index.styl"

export interface StringInterval extends Interval {
  data: string
}


function analyzeIntervals(intervals: Interval[]) {
  const height = [0]
  for (let i = 1; i < 288; i++) {
    height[i] = 0
  }

  intervals.forEach(interval => {
    const low = moment(interval.low)
    const lowMins = Math.floor((low.get("hour") * 60 + low.get("minute")) / 5)
    const high = moment(interval.high)
    const highMins = (high.get("hour") * 60 + high.get("minute")) / 5
    for (let i = lowMins; i < highMins; i++) {
      height[i]++
    }
  })
  return height
}

const now = moment()
const weekStart = now.startOf("week")


interface HeightProps {
  height: number
}

interface CalendarDayProps {
  date: number
  heights: number[]
}

class Height extends React.Component<HeightProps, void> {
  public render() {
    return (
      <div
        className={CSS.height}
        style={{ backgroundColor: this.color(this.props.height, 2) }}
      />
    )
  }

  private color(v: number, max: number) {
    return `hsl(${120 - (v / max) * 120}, 100%, 50%)`
  }
}


class CalendarDay extends React.Component<CalendarDayProps, void> {
  public shouldComponentUpdate(nextProps: CalendarDayProps) {
    return compare(this, nextProps, undefined)
  }

  public render() {
    return (
      <div className={CSS.otherDays}>
        <div className={CSS.date}>{ this.props.date }</div>
        {
          this.props.heights.map((a, i) => <Height height={a} key={i} />)
        }
        <DayHours />
      </div>
    )
  }
}

export interface CalendarWeekProps {
  intervals: IntervalTree<IcsInterval>
}

export class CalendarWeek extends React.Component<CalendarWeekProps, void> {

  public render() {
    const days = this.getDays()

    return (
      <div>
        <header>
          <h1>{now.format("MMMM YYYY")}</h1>
        </header>
        <div className={CSS.calendar}>
          <ul className={CSS.weekdays}>
            {
              moment.weekdays(true).map(v => <li className={CSS.weekday} key={v}>{v}</li>)
            }
          </ul>
          <ul className={CSS.days}>
          {
            days.map(([date, intervals]) =>
              <CalendarDay
                key={date}
                date={date}
                heights={analyzeIntervals(intervals)}
              />)
          }
          </ul>

        </div>
      </div>
    )
  }

  private getDays() {
    return [0, 1, 2, 3, 4, 5, 6]
      .map(n => moment(weekStart).add(n, "day"))
      .map((d): [number, IcsInterval[]] => [d.date(), this.props.intervals.search(+d, +d.endOf("day"))])
  }
}
