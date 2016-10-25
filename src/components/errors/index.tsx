import * as React from "react"
import { connect } from "react-redux"
import { State } from "model"

export interface ErrorDisplayProps {
  latestError: string | undefined
}

export class ErrorDisplay extends React.Component<ErrorDisplayProps, void> {
  public render() {
    return (
      <div>
        {this.props.latestError}
      </div>
    )
  }
}

function mapStateToProps(state: State): ErrorDisplayProps {
  return {
    latestError: state.errors.latestError,
  }
}

export default connect(mapStateToProps)(ErrorDisplay)
