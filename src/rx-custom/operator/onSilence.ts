import { Observable } from 'rxjs/Observable'
import { Operator } from 'rxjs/Operator'
import { Scheduler } from 'rxjs/Scheduler'
import { async } from 'rxjs/scheduler/async'
import { Subscriber } from 'rxjs/Subscriber'
import { Subscription, TeardownLogic } from 'rxjs/Subscription'

export function onSilence<T>(this: Observable<T>,
                                duration: number,
                                value: T,
                                scheduler: Scheduler = async,
                                ): Observable<T> {
  return this.lift(new OnSilenceOperator(duration, value, scheduler))
}

class OnSilenceOperator<T> implements Operator<T, T> {
  constructor(private duration: number,
              private value: T,
              private scheduler: Scheduler) {
  }

  public call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new OnSilenceSubscriber(subscriber, this.duration, this.value, this.scheduler))
  }
}

class OnSilenceSubscriber<T> extends Subscriber<T> {
  private silence?: Subscription

  constructor(destination: Subscriber<T>,
              private duration: number,
              private value: T,
              private scheduler: Scheduler) {
    super(destination)
  }

  public onSilence() {
    (this.destination.next as (value: T) => void)(this.value)
  }

  public reschedule() {
    const silence = this.silence
    if (silence != null) {
      silence.unsubscribe()
    }
    this.add(this.silence = this.scheduler.schedule(dispatchOnTimeout, this.duration, { subscriber: this }))
  }

  protected _next(value: T) {
    (this.destination.next as (value: T) => void)(value)
    this.reschedule()
  }

}

interface DispatchArg<T> {
  subscriber: OnSilenceSubscriber<T>
}

function dispatchOnTimeout<T>(arg: DispatchArg<T>) {
  const { subscriber } = arg
  subscriber.onSilence()
}
