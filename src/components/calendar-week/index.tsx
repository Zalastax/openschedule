import * as React from "react"
import compare = require("react-addons-shallow-compare")
import * as moment from "moment"
import { connect } from "react-redux"

import { Interval, IntervalTree } from "node-interval-tree"
import { IcsEntry } from "ical/ical.js"

import {
  IcsInterval,
  State,
  URL,
 } from 'model'

// Set locale to ISO 8601 weeks
import * as CSS from "./index.styl"

moment.updateLocale("en", { week: { dow: 1, doy: 4 } })

import DayHours from "./hours"


export interface StringInterval extends Interval {
  data: string
}

interface AnalyzedIntervals {
  [key: string]: number[]
}

function heightMap() {
  const height = [0]
  for (let i = 1; i < 288; i++) {
    height[i] = 0
  }

  return height
}

function analyzeIntervals(intervals: IcsInterval[], sources: URL[]): AnalyzedIntervals {
  const heights: AnalyzedIntervals = {}
  sources.forEach((url: URL) => {
    heights[url] = heightMap()
  })


  intervals.forEach(interval => {
    const height = heights[interval.source]
    const low = moment(interval.low)
    const lowMins = Math.floor((low.get('hour') * 60 + low.get('minute')) / 5)
    const high = moment(interval.high)
    const highMins = (high.get('hour') * 60 + high.get('minute')) / 5
    for (let i = lowMins; i < highMins; i++) {
      height[i] = 1 // currently throwing away overlapping intervals from same source
    }
  })
  return heights
}

function mergeAnalyzation(ai: AnalyzedIntervals): number[] {
  const height = heightMap()
  Object.values(ai).forEach((hs: number[]) => {
    for (let i = 1; i < 288; i++) {
      height[i] += hs[i]
    }
  })

  return height
}

const currentWeekStart = moment().startOf('week')

// =============================================================================
// Height
// =============================================================================

interface HeightProps {
  height: number
  max: number
}

class Height extends React.Component<HeightProps, void> {
  public render() {
    return (
      <div
        className={CSS.height}
        style={{ backgroundColor: this.color(this.props.height, this.props.max) }}
      />
    )
  }

  private color(v: number, max: number) {
    if (max < 1) {
      return `hsl(120, 100%, 50%)`
    }
    return `hsl(${120 - (v / max) * 120}, 100%, 50%)`
  }
}

// =============================================================================
// CalendarDay
// =============================================================================

interface CalendarDayProps {
  date: number
  heights: number[]
  max: number
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
          this.props.heights.map((a, i) => <Height height={a} key={i} max={this.props.max} />)
        }
        <DayHours />
      </div>
    )
  }
}

// =============================================================================
// CalendarWeek
// =============================================================================

export interface CalendarWeekProps {
  intervals: IntervalTree<IcsInterval>
  update: number
  sources: URL[]
  weekStart: moment.Moment
}

class CalendarWeek extends React.Component<CalendarWeekProps, void> {

  public render() {
    const days = this.getDays()

    return (
      <div>
        <header>
          <h1>{this.props.weekStart.format('MMMM YYYY')}</h1>
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
                heights={mergeAnalyzation(analyzeIntervals(intervals, this.props.sources))}
                max={this.props.sources.length}
              />)
          }
          </ul>

        </div>
      </div>
    )
  }

  private getDays() {
    return [0, 1, 2, 3, 4, 5, 6]
      .map(n => moment(this.props.weekStart).add(n, 'day'))
      .map((d): [number, IcsInterval[]] => [d.date(), this.props.intervals.search(+d, +d.endOf('day'))])
  }
}

function mapStateToProps(state: State): CalendarWeekProps {
  return {
    intervals: state.tree.tree,
    update: state.tree.update,
    sources: Object.keys(state.schedule),
    weekStart: moment(currentWeekStart).add(state.date.offset, 'week'),
  }
}

export default connect(mapStateToProps)(CalendarWeek)
