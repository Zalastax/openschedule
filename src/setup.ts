import 'core-js/fn/object/values'

import './setup-rx'

const isDev = (process && process.env && process.env.NODE_ENV) !== 'production'

if (isDev) {
  // tslint:disable-next-line
  require('expose?Perf!react-addons-perf')
}
