// @flow

import Router from 'koa-router'
import { Observable, Subject } from 'rxjs'
import * as util from './util'
import type { Middleware } from 'koa'

export type Epic<A, B> = (observable: Observable<A>) => Observable<B>;

type Registry = { [path: string]: Route };
type Subjects = {|
  request: Subject<Observable<Object>>;
  response: Subject<Observable<mixed>>;
|};
type HTTPMethod = 'HEAD' | 'OPTIONS' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteOptions = {
  router: Router;
  path: string;
  middlewares?: Array<Middleware>;
};

class Route {
  path: string;
  router: Router;
  methods: { [method: HTTPMethod]: Subjects; };
  middlewares: ?Array<Middleware>;

  constructor({ path, router, middlewares }: RouteOptions) {
    this.path = path
    this.router = router
    this.methods = {}
    this.middlewares = middlewares
  }

  register(method: HTTPMethod): Subjects {
    const request = new Subject()
    const response = new Subject()

    if (Array.isArray(this.middlewares)) {
      for (let middleware of this.middlewares) {
        if (typeof middleware === 'function') {
          this.router.register(this.path, [method], middleware, {
            name: undefined
          })
        }
      }
    }

    this.router.register(this.path, [method], ctx => {
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

  subscribe(method: HTTPMethod, callback: (o: Observable<any>, r: Subject<Observable<any>>) => any): Subjects {
    const {request, response} = this.getSubjects(method)
    request.subscribe(observable => callback(observable, response))
    return {request, response}
  }

  subscribeResponse(method: HTTPMethod, callback: (o: Observable<any>) => Observable<any>): Subjects {
    const {request, response} = this.getSubjects(method)
    request.subscribe(observable => response.next(callback(observable)))
    return {request, response}
  }

  subscribeEpicResponse<B>(method: HTTPMethod, epic: Epic<Object, B>): Subjects {
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

  registerEpic<B>(method: HTTPMethod, path: string, ...rest: Array<any>) {
    let epic: Epic<Object, B>;
    let middlewares: Array<Middleware>;
    if (!Array.isArray(rest[0])) {
      epic = rest[0]
    } else {
      middlewares = rest[0]
      epic = rest[1]
    }
    if (path in this.registry) {
      return this.registry[path].subscribeEpicResponse(method, epic)
    } else {
      this.registry[path] = new Route({
        router: this,
        path,
        middlewares
      })
      return this.registry[path].subscribeEpicResponse(method, epic)
    }
  }

  head<B>(...args: Array<any>): Subjects {
    return this.registerEpic('HEAD', ...args)
  }

  options<B>(...args: Array<any>): Subjects {
    return this.registerEpic('OPTIONS', ...args)
  }

  get<B>(...args: Array<any>): Subjects {
    return this.registerEpic('GET', ...args)
  }

  post<B>(...args: Array<any>): Subjects {
    return this.registerEpic('POST', ...args)
  }

  put<B>(...args: Array<any>): Subjects {
    return this.registerEpic('PUT', ...args)
  }

  patch<B>(...args: Array<any>): Subjects {
    return this.registerEpic('PATCH', ...args)
  }

  del<B>(...args: Array<any>): Subjects {
    return this.registerEpic('DELETE', ...args)
  }

  delete<B>(...args: Array<any>): Subjects {
    return this.del(...args)
  }
}

export { util }
