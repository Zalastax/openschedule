import * as React from 'react'

import CalendarSelection from 'components/calendar-selection'
import CalendarWeek from 'components/calendar-week'
import ErrorDisplay from 'components/errors'
import CalendarInput from 'components/input'
import WeekSelection from 'components/week-selection'

export default class Root extends React.Component<void, void> {

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
