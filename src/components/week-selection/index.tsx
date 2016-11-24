import { State, WEEK_OFFSET } from 'model'
import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

interface StateProps {
  offset: number
}

interface Dispatchprops {
  setOffset: (offset: number) => void
}

export interface WeekSelectionProps extends StateProps, Dispatchprops {}

export class WeekSelection extends React.Component<WeekSelectionProps, void> {
  public render() {
    return (
      <div>
        <button onClick={this.onClickLeft}>-1</button>
        {this.props.offset}
        <button onClick={this.onClickRight}>+1</button>
      </div>
    )
  }

  private onClickLeft = () => {
    this.onClick(-1)
  }

  private onClickRight = () => {
    this.onClick(1)
  }

  private onClick = (change: number) => {
    this.props.setOffset(this.props.offset + change)
  }
}

function mapStateToProps(state: State): StateProps {
  return {
    offset: state.date.offset,
  }
}

function mapDispatchToProps(dispatch: Dispatch<State>): Dispatchprops {
  return {
    setOffset: (offset: number) => { dispatch(WEEK_OFFSET(offset)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WeekSelection)
