# koa-router-rx &nbsp; [![npm version](https://badge.fury.io/js/koa-router-rx.svg)](https://badge.fury.io/js/koa-router-rx) [![Build Status](https://travis-ci.org/mfellner/koa-router-rx.svg?branch=master)](https://travis-ci.org/mfellner/koa-router-rx) [![Coverage Status](https://coveralls.io/repos/github/mfellner/koa-router-rx/badge.svg?branch=master)](https://coveralls.io/github/mfellner/koa-router-rx?branch=master)

Router middleware for [koa 2.x](https://github.com/koajs/koa/tree/v2.x) based on [koa-router](https://github.com/alexmingoia/koa-router) and [rxjs](https://github.com/ReactiveX/rxjs).

### Introduction

koa-router-rx is an extension of koa-router that supports functions of RxJS Observables instead of regular middleware. Those functions are called "Epics", a concept directly inspired by [redux-observable](https://github.com/redux-observable/redux-observable).

An Epic is a function that takes an Observable argument and returns an Observable:

```javascript
(observable: Observable<A>) => Observable<B>
```

### Usage

koa-router-rx works just like koa-router, except that it expects an Epic instead of a koa-style middleware:

```javascript
import Koa from 'koa'
import RxRouter from '../lib'

const router = new RxRouter()

router.get('/hello', observable => observable.mapTo('Hello!'))

app.use(router.routes())
app.listen(3333)
```

See the [example](example) for more details.

#### Caveats

* [Named routes](https://github.com/alexmingoia/koa-router/tree/master/#named-routes) are not supported.
* Passing [multiple Epics](https://github.com/alexmingoia/koa-router/tree/master/#multiple-middleware) is not supported.
