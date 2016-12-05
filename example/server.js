// @flow

import Koa from 'koa'
import RxRouter from '../lib'
import { Observable } from 'rxjs/Rx'

function combineEpics(...epics) {
  return observable => Observable.combineLatest(...epics.map(epic => epic(observable)))
}

function foldEpics(...epics) {
  return observable => epics.reduce((obs, epic) => epic(obs), observable)
}

const epicResponse = observable =>
  observable.mapTo('Epic response!')

const epicMap1 = observable =>
  observable.map(ctx => `Hello, ${ctx.hostname}.`)

const epicMap2 = observable =>
  observable.map(string => `${string} Rx rocks!`)

const epicFail = observable =>
  observable.mergeMapTo(Observable.throw(new Error('Epic fail!')))

const app = new Koa()
const router = new RxRouter()

router.get('/response', epicResponse)
router.get('/map', foldEpics(epicMap1, epicMap2))
router.get('/fail', combineEpics(epicResponse, epicFail))

app.use(router.routes())
app.listen(3333)
console.log('listening on http://localhost:3333')
