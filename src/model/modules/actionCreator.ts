import { isType as isType2, Action as Action2, Failure as Failure2 } from 'redux-typescript-actions'
import actionCreatorFactory from 'redux-typescript-actions'

export default actionCreatorFactory()

export const isType = isType2
export type Action<P> = Action2<P>
export type Failure<P, E> = Failure2<P, E>
