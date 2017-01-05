// @flow

import Koa from 'koa'
import RxRouter from '../lib'
import { Observable } from 'rxjs'

import type { Epic } from '../lib'

function combineEpics(...epics: Array<Epic<any,any>>): Epic<any,any> {
  // $FlowIgnore
  return observable => Observable.combineLatest(...epics.map(epic => epic(observable)))
}

function foldEpics(...epics: Array<Epic<any,any>>): Epic<any,any> {
  return observable => epics.reduce((obs, epic) => epic(obs), observable)
}

const epicResponse = observable =>
  observable.mapTo('Epic response!')

const epicResponse2 = (observable) => {
  let obs;
  obs = observable.flatMap(function(ctx) {
    return Observable.create(y => {
      setTimeout(function() {
        ctx.body = 'test';
        y.next(ctx);
        ctx.body = ctx.body + 'test3';
        y.complete();
      }, 1000);  
    });
  })
  obs = obs.flatMap(function(ctx) {
    return Observable.create(y => {
      setTimeout(function() {
        console.log(ctx.request);
        ctx.body = ctx.body + 'test2';
        y.next(ctx);
        y.complete();
      }, 2000);  
    });
  })
  return obs;
}

const epicMap1 = observable =>
  observable.map(ctx => `Hello, ${ctx.hostname}.`)

const epicMap2 = observable =>
  observable.map(string => `${string} Rx rocks!`)

const epicFail = observable =>
  observable.switchMapTo(Observable.throw(new Error('Epic fail!')))

const app = new Koa()
const router = new RxRouter()

router.get('/response', epicResponse)
router.get('/response2', epicResponse2)
router.get('/map', foldEpics(epicMap1, epicMap2))
router.get('/fail', combineEpics(epicResponse, epicFail))

app.use(router.routes())
app.listen(3333)
console.log('listening on http://localhost:3333')
