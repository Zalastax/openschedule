import 'core-js/fn/object/values'
import 'details-polyfill'
import * as moment from 'moment'

import './setup-rx'

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line
  require('expose-loader?Perf!react-addons-perf')
}

// Set locale to ISO 8601 weeks
moment.updateLocale('en-gb', { week: { dow: 1, doy: 4 } })
