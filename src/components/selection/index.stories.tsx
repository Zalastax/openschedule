import * as React from "react"
import { storiesOf } from "@kadira/storybook"

import { SelectionChange } from "model"
import { CalendarSelection } from "./index"

storiesOf("CalendarSelection", module)
  .add("empty", () => (
    <CalendarSelection
      schedule={{}}
      selection={() => {;}}
    />
  ))
  .add("one selected", () => (
    <CalendarSelection
      schedule={{
        "1 selected schedule": { interval: [], selected: false }
      }}
      selection={() => {;}}
    />
  ))
  .add("one deselected", () => (
    <CalendarSelection
      schedule={{
        "1 deselected schedule": { interval: [], selected: true }
      }}
      selection={() => {;}}
    />
  ))
