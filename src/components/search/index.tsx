import * as React from 'react'
import { connect } from 'react-redux'

import uniqBy from 'lodash/uniqBy'

import { ScoreIntervalSplit, score, IntervalSplit, fillEmpty, flatten, ScoreCheckpoint } from 'util/interval'
import { Interval } from 'node-interval-tree'
import * as moment from 'moment'
import { roundFormat } from 'util/time'

import {
  IcsInterval,
  State,
 } from 'model'

interface SearchInputProps {
  onSearch: (minutes: number) => void
}


class SearchInput extends React.Component<SearchInputProps, void> {

  private input: HTMLInputElement

  public render() {
    return (
      <div>
        <div>
        I want to find a spot that is <input
            ref={n => this.input = n}
            type='number'
            min='0'
            step='any'
            defaultValue='30'
          /> minutes long.
        </div>
        <button onClick={this.onClick}>Go</button>
      </div>
    )
  }

  private onClick = () => {
    const value = parseFloat(this.input.value)
    if (!isNaN(value)) {
      this.props.onSearch(value)
    }
  }
}

interface SearchResultsProps {
  data: ScoreCheckpoint[]
  maxCheckpointScore: number
}

class SearchResults extends React.Component<SearchResultsProps, void> {
  public render() {
    const { data, maxCheckpointScore } = this.props
    if (data.length < 2) {
      return <div />
    }
    const perfect: Interval[] = []
    const decent: Interval[] = []
    const terrible: Interval[] = []

    const terribleThreshhold = maxCheckpointScore * 1.5

    for (let i = 0; i < data.length - 1; i++) {
      const curr = data[i]
      const next = data[i + 1]
      const score = (curr.score + next.score)
      let arr = decent

      if (score === 0) {
        arr = perfect
      } else if (score > terribleThreshhold) {
        arr = terrible
      }

      arr.push({
        low: curr.time,
        high: next.time,
      })
    }

    return (
      <div>
        <details open >
          <summary>Perfect matches</summary>
          <ul>
          {
            perfect.map(this.mapLi)
          }
          </ul>
        </details>
        <details>
          <summary>Decent matches</summary>
           <ul>
          {
            decent.map(this.mapLi)
          }
          </ul>
        </details>
        <details>
          <summary>Terrible matches</summary>
           <ul>
          {
            terrible.map(this.mapLi)
          }
          </ul>
        </details>
      </div>
    )
  }

  private mapLi(v: Interval) {
    const time = `${roundFormat(v.low)} and ${roundFormat(v.high)}`
    return (<li key={time}>{`Start between ${time}`}</li>)
  }
}

interface SearchProps {
  intervals: ScoreIntervalSplit<IcsInterval>[]
  maxIntervalScore: number
}

interface SearchState {
  searchResult: ScoreCheckpoint[]
  maxCheckpointScore: number
}


class Search extends React.Component<SearchProps, SearchState> {
  public state: SearchState = {
    searchResult: [],
    maxCheckpointScore: 0,
  }

  public render() {

    return (
      <div>
        <SearchInput onSearch={this.onSearch} />
        <SearchResults data={this.state.searchResult} maxCheckpointScore={this.state.maxCheckpointScore} />
      </div>
    )
  }

  private onSearch = (minutes: number) => {
    const ms = minutes * 60 * 1000
    this.setState({
      searchResult: score(this.props.intervals, ms),
      maxCheckpointScore: ms * this.props.maxIntervalScore,
    })
  }
}

function scoreIntervalSplit(interval: IntervalSplit<IcsInterval>): ScoreIntervalSplit<IcsInterval> {
  const uniqueCount = uniqBy(interval.overlapping, v => v.source).length

  return {
    score: uniqueCount,
    low: interval.low,
    high: interval.high,
    overlapping: interval.overlapping,
  }
}

function mapStateToProps(state: State): SearchProps {
  // Just search weeks for now
  const currentWeekStart = moment().startOf('week')
  const weekStart = moment(currentWeekStart).add(state.date.offset, 'week')
  const weekEnd = moment(weekStart).endOf('week')

  const splits = fillEmpty(
                  flatten(state.tree.tree, +weekStart, +weekEnd),
                  +weekStart,
                  +weekEnd)

  const intervals = splits.map(scoreIntervalSplit)

  return {
    intervals,
    maxIntervalScore: state.schedule.selected.length,
  }
}

export default connect(mapStateToProps)(Search)
