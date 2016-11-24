import { REQUEST_URL, State, URL } from 'model'
import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

export interface CalendarInputProps {
  onGo: (url: URL) => void
}

// tslint:disable-next-line
const testCal = 'https://se.timeedit.net/web/chalmers/db1/public/ri617Q7QYn4ZQ4Q514854875yZZQ5155.ics'

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
