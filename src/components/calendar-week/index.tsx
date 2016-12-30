import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as moment from 'moment'
import { connect } from 'react-redux'

import uniqBy from 'lodash/uniqBy'
import mapValues from 'lodash/mapValues'

import { Interval, IntervalTree } from 'node-interval-tree'
import { fillEmpty, flatten, IntervalSplit } from 'interval'

import TetherComponent from 'components/tether'

import {
  IcsInterval,
  State,
  URL,
 } from 'model'

// Set locale to ISO 8601 weeks
moment.updateLocale('en-gb', { week: { dow: 1, doy: 4 } })

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
          height: this.height(),
        }}
        onClick={this.onClick}
      />
    )
  }

  private onClick = () => {
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
      <div className={CSS.intervalsplit}>
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
  focusedSplit?: IntervalSplit<IcsInterval> | Falsey
}

class CalendarDay extends React.Component<CalendarDayProps, void> {
  public render() {
    const split = this.props.focusedSplit
    return (
      <div className={CSS.otherDays}>
        <div className={CSS.date}>{ this.props.date }</div>
        {
          this.props.heights.map(this.renderHeight.bind(this, split))
        }
        <DayHours />
      </div>
    )
  }

  private renderHeight(
    focusedSplit: IntervalSplit<IcsInterval> | Falsey,
    split: IntervalSplit<IcsInterval>,
    index: number,
  ): JSX.Element {
    if (focusedSplit && focusedSplit.low === split.low && focusedSplit.high === split.high) {
      return (<TetherComponent
        key={index}
        attachment='middle left'
        targetAttachement='middle left'
        constraints={[{
          to: 'scrollParent',
          attachment: 'together',
          pin: true,
        }]}
      >
          { /* First child: This is what the item will be tethered to */ }
          {<Height split={split} max={this.props.max} onClick={this.props.onSplitClick} />}
          { /* Second child: If present, this item will be tethered to the the first child */ }
          {
            <IntervalSplitC split={split} />
          }
      </TetherComponent>)
    } else {
      return <Height split={split} key={index} max={this.props.max} onClick={this.props.onSplitClick} />
    }
  }
}

// =============================================================================
// HOC
// =============================================================================

interface Wrapper<C> {
  wrapped: C
}

function baseHoc<PT, PP, T, C extends React.Component<T, React.ComponentState>>(
  prot: PT, prop: PP) {
    return (COMPONENT: new(props?: T) => C) => {
      class HOC extends React.Component<T, void> implements Wrapper<C> {
        public wrapped: C

        constructor(props: T) {
          super(props)
          Object.assign(this, mapValues(prop, p => p.bind(this)))
        }

        public render() {
          return <COMPONENT {...this.props} ref={this.onRef} />
        }

        private onRef = (n: C) => {
          this.wrapped = n
        }
      }

      Object.assign(HOC.prototype, prot)

      return HOC as (typeof HOC) & PT & PP
    }
}

// =============================================================================
// clickOutsideHOC
// =============================================================================

function clickOutsideMulti<T, C extends React.Component<T, React.ComponentState>>(
  onClickOutside: (this: C, e: MouseEvent) => void,
  getNodes: (this: C) => Element[]) {

    interface Prot {
      componentDidMount: () => void
      componentWillUnmount: () => void
    }

    interface Prop {
      handleClickOutside: (e: MouseEvent) => void
    }

    type Out = Wrapper<C> & Prot & Prop

    const prot = {
      componentDidMount(this: Out) {
        document.addEventListener('click', this.handleClickOutside, true)
      },

      componentWillUnmount(this: Out) {
        document.removeEventListener('click', this.handleClickOutside, true)
      },
    }

    const prop = {
      handleClickOutside (this: Out, e: MouseEvent) {
        const nodes = getNodes.call(this.wrapped) as Element[]
        if (!nodes.some(node => node.contains(e.target as Node))) {
          onClickOutside.call(this.wrapped, e)
        }
      },
    }

    const ret = baseHoc<Prot, Prop, T, C>(prot, prop)
    return ret
}

function clickOutside<T, C extends React.Component<T, React.ComponentState>>(
  onClickOutside: (this: C, e: MouseEvent) => void) {
  return clickOutsideMulti<T, C>(onClickOutside, function (this: C) {
    return [ReactDOM.findDOMNode(this)].filter(n => n)
  })
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

function dayOfSplit(split: IntervalSplit<IcsInterval>) {
  return moment(split.low).date()
}

class CalendarWeek extends React.Component<CalendarWeekProps, CalendarWeekState> {

  public state: CalendarWeekState = {}

  public render() {
    const days = this.getDays()
    const split = this.state.focusedSplit

    const splitDate = split && dayOfSplit(split)

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
                onSplitClick={this.onSplitClick}
                focusedSplit={date === splitDate && split}
              />)
          }
          </ul>

        </div>
      </div>
    )
  }

  public onClickOutside(this: CalendarWeek) {
    this.setState({
      focusedSplit: undefined,
    })
  }

  public onSplitClick = (focusedSplit: IntervalSplit<IcsInterval>) => {
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

const hoc = clickOutside<CalendarWeekProps, CalendarWeek>(CalendarWeek.prototype.onClickOutside)

export default connect(mapStateToProps)(hoc(CalendarWeek))
