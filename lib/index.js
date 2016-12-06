// @flow

import Router from 'koa-router'
import { Observable, Subject } from 'rxjs/Rx'

type Epic = (observable: Observable) => Observable;
type Registry = { [path: string]: Route };
type Subjects = {| request: Subject; response: Subject; |};
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

class Route {
  path: string;
  router: Router;
  methods: { [method: HTTPMethod]: Subjects; };

  constructor(router: Router, path: string) {
    this.path = path
    this.router = router
    this.methods = {}
  }

  register(method: HTTPMethod): Subjects {
    const request = new Subject()
    const response = new Subject()

    this.router.register(this.path, [method], (ctx, next) => {
      const p = response.concatAll().first().toPromise()
      request.next(Observable.of(ctx))
      return p.then(payload => {
        if (typeof payload === 'object' && (payload.body && typeof ctx.status === 'number')) {
          Object.assign(ctx.response, payload)
        }
        else if (typeof payload === 'number') {
          ctx.response.status = payload
        }
        else if (payload !== undefined && payload !== null) {
          ctx.response.body = payload
        }
      })
    }, {
      name: undefined
    })

    this.methods[method] = {request, response}
    return this.methods[method]
  }

  getSubjects(method: HTTPMethod): Subjects {
    if (method in this.methods) {
      return this.methods[method]
    } else {
      return this.register(method)
    }
  }

  subscribe(method: HTTPMethod, callback: (o: Observable, r: Subject) => any): Subjects {
    const {request, response} = this.getSubjects(method)
    request.subscribe(observable => callback(observable, response))
    return {request, response}
  }

  subscribeResponse(method: HTTPMethod, callback: (o: Observable, r: Subject) => any): Subjects {
    const {request, response} = this.getSubjects(method)
    request.subscribe(observable => response.next(callback(observable)))
    return {request, response}
  }

  subscribeEpicResponse(method: HTTPMethod, epic: Epic): Subjects {
    const {request, response} = this.getSubjects(method)
    request.subscribe(observable => response.next(epic(observable)))
    return {request, response}
  }
}

export default class RxRouter extends Router {
  registry: Registry;

  constructor(...args: Array<mixed>) {
    super(...args)
    this.registry = {}
  }

  registerEpic(method: HTTPMethod, path: string, epic: Epic) {
    if (path in this.registry) {
      return this.registry[path].subscribeEpicResponse(method, epic)
    } else {
      this.registry[path] = new Route(this, path)
      return this.registry[path].subscribeEpicResponse(method, epic)
    }
  }

  get(path: string, epic: Epic): Subjects {
    return this.registerEpic('GET', path, epic)
  }

  post(path: string, epic: Epic): Subjects {
    return this.registerEpic('POST', path, epic)
  }

  put(path: string, epic: Epic): Subjects {
    return this.registerEpic('PUT', path, epic)
  }

  del(path: string, epic: Epic): Subjects {
    return this.registerEpic('DELETE', path, epic)
  }

  delete(path: string, epic: Epic): Subjects {
    return this.del(path, epic)
  }
}
