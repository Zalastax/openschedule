import * as React from "react"

interface Subscriber<T> {
  next(value?: T): void
  error(err: any): void
  complete(): void
  unsubscribe(): void
}

export interface CalendarInputProps {
  onGo: Subscriber<string>
}

export default class CalendarInput extends React.Component<CalendarInputProps, void> {
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
    console.log("was clicked", this.props.onGo)
    this.props.onGo.next(this.input.value)
  }
}