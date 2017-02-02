// @flow

import Koa from 'koa'
import supertest from 'supertest'
import RxRouter from '../lib'

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
      const methodSignature = new RegExp(`^${methodName}\\(path, epic\\)`)
      expect(methodBody).toMatch(methodSignature)

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
})
