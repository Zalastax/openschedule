import * as moment from 'moment'


export function round(precision: number, type: moment.unitOfTime.Base, date: moment.Moment) {
   let val = date.get(type)
   let roundedVal = Math.round(val / precision) * precision
   return date.set(type, roundedVal)
}

export function format(date: moment.Moment) {
  return date.format('MMMM D H:mm')
}

export function roundFormat(date: moment.MomentInput) {
  return format(round(1, 'minute', moment(date)))
}
