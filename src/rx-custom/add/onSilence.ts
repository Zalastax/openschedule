import { Observable } from 'rxjs/Observable'
import { onSilence } from '../operator/onSilence'

declare module 'rxjs/Observable' {
    interface Observable<T> {
        onSilence: typeof onSilence
    }
}

Observable.prototype.onSilence = onSilence
