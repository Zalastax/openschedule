import * as React from "react"
import { connect } from "react-redux"
import { Dispatch, bindActionCreators } from "redux"
import { State } from "model/modules/root"

import { REQUEST_URL } from "model/modules/calendars"
import  { ActionCreator } from "redux-typescript-actions"


interface Subscriber<T> {
  next(value?: T): void
  error(err: any): void
  complete(): void
  unsubscribe(): void
}

export interface CalendarInputProps {
  onGo: ActionCreator<string, string>
}

class CalendarInput extends React.Component<CalendarInputProps, void> {
  private input: HTMLInputElement

  public render() {
    return (
      <div>
        <input
          ref={n => this.input = n}
          defaultValue="https://se.timeedit.net/web/chalmers/db1/public/ri65YXQ2502Z51Qv9X0536Q6y6Y090665YQ5Y5gQ9075763ZZ756n103.ics"
        />
        <button onClick={this.onClick}>Go</button>
      </div>
    )
  }

  private onClick = () => {
    this.props.onGo(this.input.value)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => bindActionCreators({
  onGo: REQUEST_URL.started,
}, dispatch)

export default connect(dispatch => ({ }), mapDispatchToProps)(CalendarInput)
