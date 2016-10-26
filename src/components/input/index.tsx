import * as React from "react"
import { connect } from "react-redux"
import { Dispatch } from "redux"
import { State, REQUEST_URL, URL } from "model"

export interface CalendarInputProps {
  onGo: (url: URL) => void
}

// tslint:disable-next-line
const testCal = "https://se.timeedit.net/web/chalmers/db1/public/ri65YXQ2502Z51Qv9X0536Q6y6Y090665YQ5Y5gQ9075763ZZ756n103.ics"

export class CalendarInput extends React.Component<CalendarInputProps, void> {
  private input: HTMLInputElement

  public render() {
    return (
      <div>
        <input
          ref={n => this.input = n}
          defaultValue={testCal}
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

export default connect(_dispatch => ({ }), mapDispatchToProps)(CalendarInput)
