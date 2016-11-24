import * as React from 'react'
import * as CSS from './hours.styl'

class Hour extends React.Component<{ hour: number }, void> {
  public render() {
    return (
      <div className={CSS.hour}>
        <div>
          <div className={CSS.startBar} />
          <div className={CSS.hourLabel} >
            {this.props.hour}
          </div>
        </div>
        <div className={CSS.quarter} style={{ top: '25%' }} />
        <div className={CSS.half} style={{ top: '50%' }} />
        <div className={CSS.quarter} style={{ top: '75%' }} />
      </div>
    )
  }
}

export default class DayHours extends React.Component<void, void> {
  public render() {
    const hours: JSX.Element[] = []
    for (let i = 0; i < 24; i++) {
      hours[i] = <Hour key={i} hour={i} />
    }

    return (
      <div className={CSS.hours}>
        <div>
          <div className={CSS.quarter} style={{ top: '25%' }} />
          <div className={CSS.half} style={{ top: '50%' }} />
          <div className={CSS.quarter} style={{ top: '75%' }} />
        </div>
        {
          hours
        }
      </div>
    )
  }
}
