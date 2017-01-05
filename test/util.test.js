// @flow

import { Observable } from 'rxjs'
import * as util from '../lib/util'

const e1 = o => o.mapTo(1)
const e2 = o => o.mapTo(42)
const e3 = o => o.map(n => n + 1)
const e4 = o => o.map(n => n * n)

describe('combineEpics', () => {
  it('should combine epics', async () => {
    const epic = util.combineEpics(e1, e2)
    const result = await epic(Observable.of(0)).toPromise()
    expect(result).toEqual([1, 42])
  })
})

describe('foldEpics', () => {
  it('should fold epics', async () => {
    const epic = util.foldEpics(e3, e4)
    const result = await epic(Observable.of(1)).toPromise()
    expect(result).toEqual(4)
  })
})
