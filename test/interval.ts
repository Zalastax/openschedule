import 'mocha'
import { expect } from 'chai'

import { Interval, IntervalTree } from 'node-interval-tree'
import { searchInOrder, flatten } from '../src/util/interval'

interface StringInterval extends Interval{
  data: string
}

function iteratorToArray<T>(it: Iterator<T>) {
  const acc: T[] = []
  let last = it.next()
  while (!last.done) {
    acc.push(last.value as T)
    last = it.next()
  }
  return acc
}

describe('SearchInOrder', () => {
  it('should traverse in order based on the lowest number (key)', () => {
      const tree = new IntervalTree<StringInterval>()

      const values: [number, number, string][] = [
        [50, 150, 'data1'],
        [75, 95, 'data2'],
        [40, 105, 'data3'],
        [115, 150, 'data4'],
        [110, 120, 'data5'],
        [110, 115, 'data6']
      ]

      values.map(([low, high, data]) => ({low, high, data})).forEach(i => tree.insert(i))

      const order = ['data3', 'data1', 'data5', 'data6']
      const data = iteratorToArray(searchInOrder(tree, 100, 110)).map(v => v.data)
      expect(data).to.eql(order)
    })
})

function newSplit<T>(low: number, high: number, overlapping: T[]) {
  return { low, high, overlapping }
}

describe('flatten', () => {
  it('hej', () => {
    const tree = new IntervalTree<StringInterval>()

    const values: [number, number, string][] = [
      [50, 150, 'data1'],
      [75, 95, 'data2'],
      [40, 105, 'data3'],
      [115, 150, 'data4'],
      [110, 120, 'data5'],
      [110, 115, 'data6']
    ]

    values.map(([low, high, data]) => ({low, high, data})).forEach(i => tree.insert(i))

    const order = [
      newSplit(47, 50, ['data3']),
      newSplit(50, 75, ['data3', 'data1']),
      newSplit(75, 95, ['data2', 'data3', 'data1']),
      newSplit(95, 105, ['data3', 'data1']),
      newSplit(105, 110, ['data1'])]

    debugger

    const result = flatten(tree, 47, 110).map(s =>
      newSplit(s.low, s.high,
        s.overlapping.sort((a, b) => a.high - b.high)
        .map(v => v.data))
      )

    expect(result).to.eql(order)
  })
})
