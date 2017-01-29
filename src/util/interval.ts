import { Interval, IntervalTree, Node } from 'node-interval-tree'
import { Heap } from 'typescript-collections'

class SearchTraverser<T extends Interval> implements TraverseCustomizer<T> {
  constructor(private low: number, private high: number) {
  }

  // this.currentNode.left.max >= this.low
  public allowLeftVisit(node: Node<T>) {
    return node.max >= this.low
  }

  public allowRightVisit(node: Node<T>) {
    return node.key <= this.high
  }

  public discard(interval: T) {
    return interval.high < this.low
  }
}

export function searchInOrder<T extends Interval>(tree: IntervalTree<T>, low: number, high: number) {
  return new CustomInOrder<T>(new SearchTraverser<T>(low, high), tree)
}

interface TraverseCustomizer<T extends Interval> {
  allowLeftVisit: (node: Node<T>) => boolean
  allowRightVisit: (node: Node<T>) => boolean
  discard: (interval: T) => boolean
}

export class CustomInOrder<T extends Interval> implements IterableIterator<T> {
  private stack: Node<T>[] = []

  private currentNode?: Node<T>
  private i: number

  constructor(private traverser: TraverseCustomizer<T>, tree: IntervalTree<T>) {
    if (tree.root !== undefined) {
      this.push(tree.root)
    }
  }

  public next(): IteratorResult<T> {
    // Will only happen if stack is empty and pop is called
    if (this.currentNode === undefined) {
      return {
        done: true,
      }
    }

    // skip items outside of search range
    while (this.i < this.currentNode.records.length && this.traverser.discard(this.currentNode.records[this.i])) {
        this.i++
    }

    // Process this node
    if (this.i < this.currentNode.records.length) {
      return {
        done: false,
        value: this.currentNode.records[this.i++],
      }
    }

    const right = this.currentNode.right
    if ( right != null && this.traverser.allowRightVisit(right)) { // Can we go right?
      this.push(right)
    } else { // Otherwise go up
      // Might pop the last and set this.currentNode = undefined
      this.pop()
    }
    return this.next()
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this
  }

  private push(node: Node<T>) {
    this.currentNode = node
    this.i = 0

    while (this.currentNode.left !== undefined && this.traverser.allowLeftVisit(this.currentNode.left)) {
      this.stack.push(this.currentNode)
      this.currentNode = this.currentNode.left
    }
  }

  private pop() {
    this.currentNode = this.stack.pop()
    this.i = 0
  }
}

export interface IntervalSplit<T extends Interval> {
  low: number
  high: number
  overlapping: T[]
}

function compHigh<T extends Interval>(a: T, b: T) {
  return a.high - b.high
}

function newSplit<T>(low: number, high: number, overlapping: T[]) {
  return { low, high, overlapping }
}

function toArray <T>(heap: Heap<T>): T[] {
  return (heap as any).data.concat()
}

class FlattenTraverser<T extends Interval> implements TraverseCustomizer<T> {
  constructor(private low: number, private high: number) {
  }

  public allowLeftVisit(node: Node<T>) {
    return node.max >= this.low
  }

  public allowRightVisit(node: Node<T>) {
    return node.key <= this.high
  }

  public discard(interval: T) {
    return interval.high < this.low || interval.low >= this.high
  }
}

export function flatten<T extends Interval>(tree: IntervalTree<T>, low: number, high: number) {
  const it = new CustomInOrder(new FlattenTraverser(low, high), tree)
  const queue = new Heap<T>(compHigh)
  const acc: IntervalSplit<T>[] = []
  let last = it.next()
  if (last.done) {
    return []
  }
  let value = last.value as T
  let temp: IntervalSplit<T> = newSplit(Math.max(value.low, low), Math.max(value.low, low), [])
  queue.add(value)

  function flushTo(until: number) {
    let peek = queue.peek()
    while (peek !== undefined && peek.high <= until) {
      Array.prototype.push.apply(temp.overlapping, toArray(queue))
      const top = queue.removeRoot()
      peek = queue.peek()

      temp.high = top.high
      acc.push(temp)
      temp = newSplit(top.high, top.high, [])

      // avoid creating intervals where low = high
      while (peek !== undefined && peek.high === top.high) {
        queue.removeRoot()
        peek = queue.peek()
      }

    }
  }

  last = it.next()

  while (!last.done) {
    value = last.value as T

    flushTo(value.low)
    if (queue.isEmpty()) {
      temp.low = value.low
    } else {
      Array.prototype.push.apply(temp.overlapping, toArray(queue))
      temp.high = value.low
      acc.push(temp)
      temp = newSplit(value.low, value.low, [])
    }

    queue.add(value)

    last = it.next()
  }

  flushTo(high)
  if (!queue.isEmpty()) {
    Array.prototype.push.apply(temp.overlapping, toArray(queue))
    temp.high = high
    acc.push(temp)
  }

  return acc
}

export function fillEmpty<T extends Interval>(splits: IntervalSplit<T>[], low: number, high: number) {
  if (splits.length === 0) {
    return [newSplit(low, high, [])]
  }

  const ret = []
  let temp = low
  for (let split of splits) {
    if (temp < split.low) {
      ret.push(newSplit(temp, split.low, []))
    }
    ret.push(split)
    temp = split.high
  }

  if (splits[splits.length - 1].high < high) {
    ret.push(newSplit(splits[splits.length - 1].high, high, []))
  }

  return ret
}

export interface ScoreIntervalSplit<T extends Interval> extends IntervalSplit<T> {
  score: number
}

function safeInc(max: number, current: number) {
  return Math.min(max, current + 1)
}

export interface ScoreCheckpoint {
  time: number
  score: number
}

// Assumes splits are continuous, non-empty, and have a total length greater than findMilliseconds
// i.e. have ben run through fillEmpty.
// Returns an array of score checkpoints, which are ordered by time.
// A score checkpoint is a snapshot of how good it is to start at that time.
// The score between two checkpoints can be linearly interpolated
export function score<T extends Interval>(
  splits: ScoreIntervalSplit<T>[],
  // range: ScoreRangeDay,
  findMilliseconds: number,
  ): ScoreCheckpoint[] {
  const inc: (current: number) => number = safeInc.bind(undefined, splits.length - 1)
  // special case if there's only one interval in split
  if (splits.length === 1) {
    const elem = splits[0]
    const low = elem.low
    const high = elem.high
    const score = findMilliseconds * elem.score
    return [
      { time: low, score },
      { time: high, score },
      ]
  }

  const ret: ScoreCheckpoint[] = []

  // inidices for sliding window
  let l = 0
  let r = 0

  // goals for the sliding windows high and low values
  let low = splits[l].low
  let high = low + findMilliseconds

  // move end of sliding window until it meets the goal
  while (splits[r].high < high && r < splits.length) {
    r++
  }

  // stop when end of sliding window has reached end of range
  while (r < splits.length) {

    // determine next l and r so they're available when scoring
    let nextL = l
    let nextR = r
    let nextLow = low
    let nextHigh = high

    if (l === splits.length - 1) {
      nextR = splits.length
    } else {
        // guard against increasing l or r too much
      let safeNextR = inc(r)
      let safeNextL = inc(l)
      let distToNextL = splits[safeNextL].low - low
      let distToNextR = splits[safeNextR].high - high

      if (distToNextL < distToNextR) {
        nextL = safeNextL
        nextLow = splits[nextL].low
        nextHigh = nextLow + findMilliseconds

        // move right index if needed
        if (nextHigh > splits[r].high) {
          nextR = safeNextR
        }
      } else if (distToNextL > distToNextR) {
        nextR = safeNextR
        nextHigh = splits[nextR].high
        nextLow = nextHigh - findMilliseconds
      } else {
        // should only happen if we are done or splits after each other are of length findMinutes,
        // meaning that we don't want to use safeNext so that the loop will exit
        nextL++
        nextR++
        nextLow = splits[nextL].low
        nextHigh = nextLow + findMilliseconds
      }
    }

    const snapshot: ScoreCheckpoint = {
      time: low,
      score: 0,
    }

    // special case score for first and last element
    snapshot.score += (Math.min(splits[l].high, high) - low) * splits[l].score
    // don't double count if first and last element are the same
    if (l !== r) {
      snapshot.score += (high - splits[r].low) * splits[r].score
    }

    // give a score for the current sliding window, excluding first and last element (already handled)
    for (let i = l + 1; i <= r - 1; i++) {
      let elem = splits[i]
      snapshot.score += (elem.high - elem.low) * elem.score
    }

    ret.push(snapshot)
    if (nextLow - low > findMilliseconds) {
      const extraSnapshot: ScoreCheckpoint = {
        time: nextLow - findMilliseconds,
        score: snapshot.score,
      }
      ret.push(extraSnapshot)
    }
    l = nextL
    r = nextR
    low = nextLow
    high = nextHigh
  }

  const lastSnapshot = ret[ret.length - 1]
  const endTime = splits[splits.length - 1].high - findMilliseconds

  if (endTime > lastSnapshot.time) {
    ret.push({
      time: endTime,
      score: lastSnapshot.score,
    })
  }

  return ret
}
