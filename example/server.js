// @flow

import Koa from 'koa'
import RxRouter, { util } from '../lib'
import { Observable } from 'rxjs'

import type { Epic } from '../lib'

const epicResponse = observable =>
  observable.mapTo('Epic response!')

const epicMap1 = observable =>
  observable.map(ctx => `Hello, ${ctx.hostname}.`)

const epicMap2 = observable =>
  observable.map(string => `${string} Rx rocks!`)

const epicFail = observable =>
  observable.switchMapTo(Observable.throw(new Error('Epic fail!')))

const app = new Koa()
const router = new RxRouter()

router.get('/response', epicResponse)
router.get('/map', util.foldEpics(epicMap1, epicMap2))
router.get('/fail', util.combineEpics(epicResponse, epicFail))

app.use(router.routes())
app.listen(3333)
console.log('listening on http://localhost:3333')
