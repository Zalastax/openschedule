import 'mocha'

import { filterUndefined } from '../src/rx-custom/operator/filterUndefined'

declare var expectObservable: any
declare var cold: any
declare function asDiagram(operatorLabel: any, glit?: any): (description: any, specFn: any) => void


describe('filterUndefined', () => {

  const values = {
    u: undefined,
    v: 1,
  }

  it('removes events that are undefined', () => {
    const start   = cold('---u---v---|', values)
    const source = filterUndefined.call(start)
    const expected =     '-------v---|'
    expectObservable(source).toBe(expected, values)
  })

  asDiagram('filterUndefined')('diagram', () => {
    const start   = cold('---u---v---|', values)
    const source = filterUndefined.call(start)
    const expected =     '-------v---|'

    expectObservable(source).toBe(expected, values)
  })

})
