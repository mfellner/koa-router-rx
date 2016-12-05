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
        if (typeof payload === 'object' && (payload.body || typeof ctx.status === 'number')) {
          Object.assign(ctx, payload)
        }
        else if (typeof payload === 'number') {
          ctx.status = payload
        }
        else if (payload !== undefined && payload !== null) {
          ctx.body = payload
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

function RxRouter(options?: Object) {
  const registry: Registry = {}

  const resolveRouteForMethod = (method: HTTPMethod) => (router: Router) => (path: string, epic: Epic) => {
    if (path in registry) {
      return registry[path].subscribeEpicResponse(method, epic)
    } else {
      registry[path] = new Route(router, path)
      return registry[path].subscribeEpicResponse(method, epic)
    }
  }

  const methods = {
    get: resolveRouteForMethod('GET'),
    post: resolveRouteForMethod('POST'),
    put: resolveRouteForMethod('PUT'),
    del: resolveRouteForMethod('DELETE'),
    delete: resolveRouteForMethod('DELETE')
  }

  return new Proxy(new Router(), {
    get: function(target, property, receiver) {
      if (property in methods) {
        return methods[property](target)
      } else {
        return target[property]
      }
    }
  })
}

export default new Proxy(Router, {
  construct: (target, argumentsList, newTarget) => RxRouter(...argumentsList),
  apply: (target, thisArg, argumentsList) => RxRouter(...argumentsList)
})
