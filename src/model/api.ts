import { URL } from "model"
import { ajax } from "rxjs/observable/dom/ajax.js"

export class Api {
  proxy(url: URL) {
    return ajax({
      url: `${SERVER_URL}/proxy/${encodeURIComponent(url)}`,
      crossDomain: true,
      responseType: "text",
    })
  }
}
