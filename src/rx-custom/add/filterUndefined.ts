import { Observable } from 'rxjs/Observable'
import { filterUndefined } from '../operator/filterUndefined'

declare module 'rxjs/Observable' {
    interface Observable<T> {
        filterUndefined: typeof filterUndefined
    }
}

Observable.prototype.filterUndefined = filterUndefined
