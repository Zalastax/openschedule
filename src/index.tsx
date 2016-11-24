import './setup'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import configureStore from 'model/configureStore'
import { Provider } from 'react-redux'

import './index.styl'

import CalendarSelection from 'components/calendar-selection'
import CalendarWeek from 'components/calendar-week'
import ErrorDisplay from 'components/errors'
import CalendarInput from 'components/input'
import WeekSelection from 'components/week-selection'

const store = configureStore({})

class Out extends React.Component<void, void> {

  constructor(props?: void, context?: any) {
    super(props, context)
  }

  public render() {
    return (
      <div>
        <CalendarInput />
        <CalendarSelection />
        <WeekSelection />
        <ErrorDisplay />
        <CalendarWeek />
      </div>
    )
  }
}

ReactDOM.render(
  <Provider store={store}>
    <Out />
  </Provider>,
  document.getElementById('content') as HTMLElement,
)
