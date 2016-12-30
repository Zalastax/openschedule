import * as React from 'react'
import { isHot } from './setup'

export function hotwrap<T>(element: React.ReactElement<T>) {
  if (isHot) {
    const AppContainer = require('react-hot-loader').AppContainer
    return (
      <AppContainer>{element}</AppContainer>
    )
  } else {
    return element
  }
}
