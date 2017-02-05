// @flow

import Koa from 'koa'
import supertest from 'supertest'
import RxRouter from '../lib'
import type { Middleware } from 'koa'

describe('RxRouter', () => {
  let server

  afterEach(() => { if (server) server.close() })

  function init(router: RxRouter) {
    const app = new Koa()
    app.use(router.routes())
    app.use(router.allowedMethods())
    server = app.listen(3333)
    return supertest.agent(server)
  }

  it('should support a single route and Epic', async () => {
    const router = new RxRouter()
    const epic = obs => obs.map(ctx => `test-${ctx.params.id}`)
    router.get('/test/:id', epic)

    await init(router).get('/test/hello').expect(200).expect('test-hello')
  })

  it('should support multiple routes and methods', async () => {
    const router = new RxRouter()
    const methods = [
      'head',
      'options',
      'get',
      'post',
      'put',
      'patch',
      'del',
      'delete'
    ]

    for (let methodName of methods) {
      expect(methodName in router).toBe(true)

      const methodBody = router[methodName].toString()

      // $FlowIgnore https://github.com/facebook/flow/issues/2286
      router[methodName](`/${methodName}`, obs => obs.mapTo(methodName))
    }

    const request = init(router)

    for (let methodName of methods) {
      const {text} = await request[methodName](`/${methodName}`).expect(200)
      if (methodName !== 'head') {
        expect(text).toEqual(methodName)
      }
    }
  })

  it('should support multiple methods on the same route', async () => {
    const router = new RxRouter()
    router.get('/test', obs => obs.mapTo(200))
    router.post('/test', obs => obs.mapTo(201))

    const request = init(router)
    await request.get('/test').expect(200)
    await request.post('/test').expect(201)
    await request.put('/test').expect(405) // Method Not Allowed
  })

  it('should map Observables of number to status code', async () => {
    const router = new RxRouter()
    router.put('/teapot', obs => obs.mapTo(418))

    await init(router).put('/teapot').expect(418)
  })

  it('should merge Observables of Response-like into Response', async () => {
    const router = new RxRouter()
    router.put('/teapot', obs => obs.mapTo({body: 'tea', status: 418}))

    await init(router).put('/teapot').expect(418).expect('tea')
  })

  it('supports named routes', async () => {
    const router = new RxRouter()
    const epic = obs => obs.map(ctx => `test-${ctx.params.id}`)
    router.get('my-name-route', '/test/:id', epic)

    expect(router.url('my-name-route', 3333)).toEqual('/test/3333')

    await init(router).get('/test/hello').expect(200).expect('test-hello')
  })

  it('supports middlewares if provided as an array in second argument', async () => {
    const message = 'Route requires: Headers - "Content-Type" must be "application/json"'
    const mwPostJson: Middleware = async (ctx, next) => {
      if (ctx.request.is('application/json')) { return next(); }

      const errStatus = 400
      ctx.body = {
        code: errStatus,
        message,
        status: 'error'
      }
      ctx.status = errStatus
    }

    const router = new RxRouter()
    const expectedPostResponse = {
      my: 'data'
    }
    const epic = obs => obs.map(ctx => expectedPostResponse)
    router.post('/test/:id', [ mwPostJson ], epic)

    const testServer = init(router)
    await testServer.post('/test/hello').expect(400).expect({
      code: 400,
      message,
      status: 'error'
    })

    await testServer.post('/test/hello')
      .set({
        'Accept': 'application/json'
      })
      .send({ json: 'data' })
      .expect(200)
      .expect(expectedPostResponse)
      .expect((res) => {
        expect(res.body)
          .toEqual(expectedPostResponse)
      })
  })
})
