// @flow

import Koa from 'koa'
import supertest from 'supertest-as-promised'
import RxRouter from '../lib'

describe('RxRouter', () => {
  let server

  afterEach(() => { if (server) server.close() })

  function init(router: RxRouter) {
    const app = new Koa()
    app.use(router.routes())
    server = app.listen(3333)
    return supertest.agent(server)
  }

  it('should support a single route and Epic', async () => {
    const router = new RxRouter()
    const epic = obs => obs.map(ctx => `test-${ctx.params.id}`)
    router.get('/test/:id', epic)

    await init(router).get('/test/hello').expect(200).expect('test-hello')
  })

  it('should support multiple routes, methods and Epics', async () => {
    const router = new RxRouter()

    router.get('/test1', obs => obs.mapTo('get-test1'))
    router.post('/test1', obs => obs.mapTo('post-test1'))
    router.put('/test2', obs => obs.mapTo('put-test2'))

    const request = init(router)

    await request.get('/test1').expect('get-test1')
    await request.post('/test1').expect('post-test1')
    await request.put('/test2').expect('put-test2')
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
