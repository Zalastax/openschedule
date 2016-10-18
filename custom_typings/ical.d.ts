declare module "ical/ical.js" {
  
  export interface IcsEntry {
    type: string
    params: any[]
    start: Date
    end: Date
    uid: string
    dtstamp: string
    "last-modified": string
    summary: string
    location: string
    description: string
  }

  export interface Ics {
    [key: string]: IcsEntry
  }

  export function parseICS(data: string): Ics
}
