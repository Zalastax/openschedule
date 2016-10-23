import * as React from "react"
import { storiesOf } from "@kadira/storybook"

import { CalendarInput } from "./index"

storiesOf("CalendarInput", module)
  .add("base", () => (
    <CalendarInput onGo={() => {;}} />
  ))
