import * as React from 'react'
import compare = require('react-addons-shallow-compare')
import * as moment from 'moment'
import { connect } from 'react-redux'

import { Interval, IntervalTree } from 'node-interval-tree'
import { fillEmpty, flatten, IntervalSplit } from 'interval'

import {
  IcsInterval,
  State,
  URL,
 } from 'model'

// Set locale to ISO 8601 weeks
moment.updateLocale('en', { week: { dow: 1, doy: 4 } })

import DayHours from './hours'

import * as CSS from './index.styl'

export interface StringInterval extends Interval {
  data: string
}

function clamp(min: number, max: number, value: number) {
  return Math.max(min, Math.min(max, value))
}

const currentWeekStart = moment().startOf('week')

// =============================================================================
// Height
// =============================================================================

interface HeightProps {
  split: IntervalSplit<IcsInterval>
  max: number
}

class Height extends React.Component<HeightProps, void> {
  public render() {
    return (
      <div
        style={{
          backgroundColor: this.color(this.props.split.overlapping.length, this.props.max),
          height: this.height()
        }}
      />
    )
  }

  private color(v: number, max: number) {
    if (max < 1) {
      return `hsl(120, 100%, 50%)`
    }
    return `hsl(${120 - clamp(0, 1, v / max) * 120}, 100%, 50%)`
  }

  private height() {
    const split = this.props.split
    return (split.high - split.low) / (1000 * 60 * 2)
  }
}

// =============================================================================
// CalendarDay
// =============================================================================

interface CalendarDayProps {
  date: number
  heights: IntervalSplit<IcsInterval>[]
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
          this.props.heights.map((a, i) => <Height split={a} key={i} max={this.props.max} />)
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
    console.log(days)

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
            days.map(([date, splits]) =>
              <CalendarDay
                key={date}
                date={date}
                heights={splits}
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
      .map((d): [number, IntervalSplit<IcsInterval>[]] => {
        const date = d.date()
        const start = +d
        const end = +d.endOf('day')
        return [date, fillEmpty(flatten(this.props.intervals, start, end), start, end)]
      })
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
