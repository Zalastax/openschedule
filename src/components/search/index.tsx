import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { ScoreCheckpoint } from 'util/interval'
import { Interval } from 'node-interval-tree'
import { roundFormat } from 'util/time'
import { forPair } from 'util/array'

import {
  State,
  SEARCH,
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

    forPair((curr, next) => {
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
    }, data)

    return (
      <div>
        <details open >
          <summary>Perfect matches</summary>
          <ul>
          {
            this.merge(perfect).map(this.mapLi)
          }
          </ul>
        </details>
        <details>
          <summary>Decent matches</summary>
           <ul>
          {
            this.merge(decent).map(this.mapLi)
          }
          </ul>
        </details>
        <details>
          <summary>Terrible matches</summary>
           <ul>
          {
            this.merge(terrible).map(this.mapLi)
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

  private merge(arr: Interval[]) {
    if (arr.length < 2) {
      return arr
    }

    const ret: Interval[] = []
    let temp = arr[0]
    for (let i = 1; i < arr.length; i++) {
      const curr = arr[i]
      if (temp.high === curr.low) {
        temp = {
          low: temp.low,
          high: curr.high,
        }
      } else {
        ret.push(temp)
        temp = curr
      }
    }

    return ret
  }
}

interface SearchStateProps {
  result: ScoreCheckpoint[]
  maxCheckpointScore: number
}

interface SearchDispatchProps {
  onSearch: (minutes: number) => void
}

interface SearchProps extends SearchDispatchProps, SearchStateProps {}

class Search extends React.Component<SearchProps, void> {

  public render() {

    return (
      <div>
        <SearchInput onSearch={this.props.onSearch} />
        <SearchResults data={this.props.result} maxCheckpointScore={this.props.maxCheckpointScore} />
      </div>
    )
  }
}

function mapStateToProps(state: State): SearchStateProps {
  return state.search
}

const mapDispatchToProps = (dispatch: Dispatch<State>): SearchDispatchProps => {
  return {
    onSearch: (minutes: number) => { dispatch(SEARCH(minutes)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
