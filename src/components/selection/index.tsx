import * as React from "react"
import { connect } from "react-redux"
import { Dispatch, bindActionCreators } from "redux"
import { State } from "model/modules/root"

import { SELECTION_CHANGE, CalendarsState, SelectionChange } from "model"


interface Subscriber<T> {
  next(value?: T): void
  error(err: any): void
  complete(): void
  unsubscribe(): void
}

interface StateProps {
  schedule: CalendarsState
}

type SC = typeof SELECTION_CHANGE


interface DispatchProps {
  selection: (change: SelectionChange) => void
}

export interface CalendarSelectionProps extends DispatchProps, StateProps {}

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
            type="checkbox"
            checked={this.props.selected}
            onChange={this.onChange}
            />
          {this.props.name}
        </label>
      </li>
    )
  }

  private onChange = (event: React.FormEvent) => {
    const target = event.target as React.HTMLProps<HTMLInputElement>
    console.log(target.checked)
    this.props.onChange({
      name: this.props.name,
      value: !!target.checked,
    })
  }
}

export class CalendarSelection extends React.Component<CalendarSelectionProps, void> {
  public render() {
    return (
      <ul>
        {
          Object.keys(this.props.schedule).map(name => (
            <Selection
              key={name}
              name={name}
              onChange={this.props.selection}
              selected={this.props.schedule[name].selected}
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
