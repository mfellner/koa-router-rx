// @flow

import { Observable } from 'rxjs'
import * as util from '../lib/util'

const e1 = o => o.mapTo(1)
const e2 = o => o.mapTo(42)
const e3 = o => o.map(n => n + 1)
const e4 = o => o.map(n => n * n)

describe('combineEpics', () => {
  it('should not combine 1 epic', () => {
    let err = null
    try {
      util.combineEpics(e1)
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(Error)
  })

  it('should combine 2 epics', async () => {
    const epic = util.combineEpics(e1, e2)
    const result = await epic(Observable.of(0)).toPromise()
    expect(result).toEqual([1, 42])
  })

  it('should combine multiple epics', async () => {
    const epics = [e1, e2, e2, e1, e1, e1, e2, e1]
    const results = [1, 42, 42, 1, 1, 1, 42, 1]

    for (let i = 3; i <= epics.length; i += 1) {
      const epic = util.combineEpics(...epics.slice(0, i))
      const result = await epic(Observable.of(0)).toPromise()
      expect(result).toEqual(results.slice(0, i))
    }
  })

  it('should not combine more than 8 epics', () => {
    let err = null
    try {
      util.combineEpics(e1, e1, e1, e1, e1, e1, e1, e1, e1)
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(Error)
  })
})

describe('foldEpics', () => {
  it('should fold epics', async () => {
    const epic = util.foldEpics(e3, e4)
    const result = await epic(Observable.of(1)).toPromise()
    expect(result).toEqual(4)
  })
})
