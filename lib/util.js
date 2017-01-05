// @flow

import { Observable } from 'rxjs'

import type { Epic } from './'

export function combineEpics(...epics: Array<Epic<any,any>>): Epic<any,any> {
  // $FlowIgnore
  return observable => Observable.combineLatest(...epics.map(epic => epic(observable)))
}

export function foldEpics(...epics: Array<Epic<any,any>>): Epic<any,any> {
  return observable => epics.reduce((obs, epic) => epic(obs), observable)
}
