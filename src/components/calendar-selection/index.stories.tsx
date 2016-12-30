import { storiesOf } from '@kadira/storybook'
import * as React from 'react'

import { CalendarSelection } from './index'

storiesOf('CalendarSelection', module)
  .add('empty', () => (
    <CalendarSelection
      schedule={{
        byURL: {},
        selected: []
      }}
      selection={() => {;}}
    />
  ))
  .add('one selected', () => (
    <CalendarSelection
      schedule={{
        byURL: {
          '1 selected schedule': {
            intervals: [],
            selected: true,
          }
        },
        selected: ['1 selected schedule']
      }}
      selection={() => {;}}
    />
  ))
  .add('one deselected', () => (
    <CalendarSelection
      schedule={{
        byURL: {
          '1 deselected schedule': {
            intervals: [],
            selected: false,
          }
        },
        selected: []
      }}
      selection={() => {;}}
    />
  ))
