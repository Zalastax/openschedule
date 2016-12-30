import { FILE_LOAD, REQUEST_URL, State, URL } from 'model'
import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import FileInput from 'components/file-input'

export interface CalendarInputProps {
  onGo: (url: URL) => void
  onFile: (content: string, name: string) => void
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
        <FileInput as='text' onChange={(_, results) => {
          results.forEach(([e, f]) => {
            const result = (e.target as any).result
            this.props.onFile(result, f.name)
          })
        }} />
      </div>
    )
  }

  private onClick = () => {
    this.props.onGo(this.input.value)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<State>): CalendarInputProps => {
  return {
    onGo: (url: URL) => { dispatch(REQUEST_URL.started(url)) },
    onFile: (content: string, name: string) => { dispatch(FILE_LOAD.started({ content, name })) },
  }
}

export default connect(_dispatch => ({ }), mapDispatchToProps)(CalendarInput)
