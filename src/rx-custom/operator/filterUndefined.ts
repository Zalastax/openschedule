import { Observable } from 'rxjs'

export function filterUndefined<T>(this: Observable<T | undefined>): Observable<T> {
  return this.filter(x => typeof x !== 'undefined')
}
