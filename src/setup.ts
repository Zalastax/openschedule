import 'core-js/fn/object/values'

import './setup-rx'

export const isDev = (process && process.env && process.env.NODE_ENV) !== 'production'
export const isHot = (module as any).hot

if (isDev) {
  // tslint:disable-next-line
  require('expose-loader?Perf!react-addons-perf')
}
