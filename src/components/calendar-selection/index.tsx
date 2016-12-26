import { State } from 'model'
import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import {
  CalendarsState,
  SELECTION_CHANGE,
  SelectionChange,
} from 'model'

interface SelectionProps {
  name: string
  selected: boolean
  onChange: (change: SelectionChange) => void
}

class Selection extends React.Component<SelectionProps, void> {
  public render() {
    return (
      <li>
        <label>
          <input
            type='checkbox'
            checked={this.props.selected}
            onChange={this.onChange}
            />
          {this.props.name}
        </label>
      </li>
    )
  }

  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.currentTarget
    this.props.onChange({
      name: this.props.name,
      value: !!target.checked,
    })
  }
}

interface StateProps {
  schedule: CalendarsState
}

interface DispatchProps {
  selection: (change: SelectionChange) => void
}

export interface CalendarSelectionProps extends DispatchProps, StateProps {}

export class CalendarSelection extends React.Component<CalendarSelectionProps, void> {
  public render() {
    return (
      <ul>
        {
          Object.keys(this.props.schedule.byURL).map(name => (
            <Selection
              key={name}
              name={name}
              onChange={this.props.selection}
              selected={this.props.schedule.byURL[name].selected}
            />
          ))
        }
      </ul>
    )
  }
}

function mapStateToProps(state: State): StateProps {
  return {
    schedule: state.schedule,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
  return {
    selection: (change: SelectionChange) => { dispatch(SELECTION_CHANGE(change)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CalendarSelection)
