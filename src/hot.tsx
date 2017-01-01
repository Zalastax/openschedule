import * as React from 'react'


export function hotwrap<T>(element: React.ReactElement<T>) {
  if (process.env.HOT) {
    const AppContainer = require('react-hot-loader').AppContainer
    return (
      <AppContainer>{element}</AppContainer>
    )
  } else {
    return element
  }
}
