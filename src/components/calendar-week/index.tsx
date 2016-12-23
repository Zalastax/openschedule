import * as React from 'react'
import * as ReactDOM from 'react-dom'
import compare = require('react-addons-shallow-compare')
import * as moment from 'moment'
import { connect } from 'react-redux'
import { uniqBy } from 'lodash'

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
  onClick: (split: IntervalSplit<IcsInterval>) => void
}

class Height extends React.Component<HeightProps, void> {
  public render() {
    const uniqueCount = uniqBy(this.props.split.overlapping, v => v.source).length
    return (
      <div
        style={{
          backgroundColor: this.color(uniqueCount, this.props.max),
          height: this.height()
        }}
        onClick={this.onClick}
      />
    )
  }

  onClick = () => {
    this.props.onClick(this.props.split)
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
// IntervalSplitC
// =============================================================================

interface IntervalSplitCProps {
  split: IntervalSplit<IcsInterval>
}

class IntervalSplitC extends React.Component<IntervalSplitCProps, void> {
  public render() {
    return (
      <div>
        {moment(this.props.split.low).format()} - {moment(this.props.split.high).format()}:
        <ul>
        {
          this.props.split.overlapping.map(v => <li key={v.source}>{v.source}</li>)
        }
        </ul>
      </div>
    )
  }
}


// =============================================================================
// CalendarDay
// =============================================================================

interface CalendarDayProps {
  date: number
  heights: IntervalSplit<IcsInterval>[]
  max: number
  onSplitClick: (split: IntervalSplit<IcsInterval>) => void
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
          this.props.heights.map((a, i) => <Height split={a} key={i} max={this.props.max} onClick={this.props.onSplitClick} />)
        }
        <DayHours />
      </div>
    )
  }
}

// =============================================================================
// clickOutsideHOC
// =============================================================================

interface ClickOutside {
  onClickOutside: (e: MouseEvent) => void
}


function clickOutside<T>(
  Comp: new(props?: T) => React.Component<T, React.ComponentState> & ClickOutside
) {
  return class ClickOutsideHOC extends React.Component<T, void> {
    private wrapped: React.Component<T, React.ComponentState> & ClickOutside

    componentDidMount() {
      document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
      document.removeEventListener('click', this.handleClickOutside, true);
    }

    private handleClickOutside = (e: MouseEvent) => {
      const node = ReactDOM.findDOMNode(this.wrapped)
      if (node != null) {
        if (node.contains(e.target as Node)) {
          this.wrapped.onClickOutside(e)
        }
      }
    }

    private onRef = (n: React.Component<T, React.ComponentState> & ClickOutside) => {
      this.wrapped = n
    }

    render() {
      return <Comp {...this.props} ref={this.onRef} />
    }
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

interface CalendarWeekState {
  focusedSplit?: IntervalSplit<IcsInterval>
}

class CalendarWeek extends React.Component<CalendarWeekProps, CalendarWeekState> implements ClickOutside {

  state: CalendarWeekState = {}

  render() {
    const days = this.getDays()

    return (
      <div>
        {
          this.state.focusedSplit && <IntervalSplitC split={this.state.focusedSplit} />
        }
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
                onSplitClick={this.onSplitClick}
              />)
          }
          </ul>

        </div>
      </div>
    )
  }

  onClickOutside() {
    this.setState({
      focusedSplit: undefined,
    })
  }

  onSplitClick = (focusedSplit: IntervalSplit<IcsInterval>) => {
    this.setState({
      focusedSplit,
    })
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
    sources: state.schedule.selected,
    weekStart: moment(currentWeekStart).add(state.date.offset, 'week'),
  }
}

export default connect(mapStateToProps)(clickOutside(CalendarWeek))
