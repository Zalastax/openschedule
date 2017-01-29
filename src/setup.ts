import 'core-js/fn/object/values'
import 'details-polyfill'

import './setup-rx'

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line
  require('expose-loader?Perf!react-addons-perf')
}
