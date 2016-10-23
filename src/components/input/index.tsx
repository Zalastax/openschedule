import * as React from "react"
import { connect } from "react-redux"
import { Dispatch, bindActionCreators } from "redux"
import { State, REQUEST_URL, URL } from "model"

import  { Action } from "redux-typescript-actions"


interface Subscriber<T> {
  next(value?: T): void
  error(err: any): void
  complete(): void
  unsubscribe(): void
}

export interface CalendarInputProps {
  onGo: (url: URL) => void
}

export class CalendarInput extends React.Component<CalendarInputProps, void> {
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

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
  return {
    onGo: (url: URL) => { dispatch(REQUEST_URL.started(url)) },
  }
}

export default connect(dispatch => ({ }), mapDispatchToProps)(CalendarInput)
