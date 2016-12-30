import { Observable } from 'rxjs/Observable'

export function filterUndefined<T>(this: Observable<T | undefined>): Observable<T> {
  return this.filter(x => typeof x !== 'undefined')
}
