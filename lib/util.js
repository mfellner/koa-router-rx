// @flow

import { Observable } from 'rxjs'

type Epic<A, B> = (observable: Observable<A>) => Observable<B>;

export function combineEpics(...epics: Array<Epic<any,any>>): Epic<any,any> {
  if (epics.length === 2) {
    return o => Observable.combineLatest(epics[0](o), epics[1](o))
  }
  else if (epics.length === 3) {
    return o => Observable.combineLatest(
      epics[0](o),
      epics[1](o),
      epics[2](o))
  }
  else if (epics.length === 4) {
    return o => Observable.combineLatest(
      epics[0](o),
      epics[1](o),
      epics[2](o),
      epics[3](o))
  }
  else if (epics.length === 5) {
    return o => Observable.combineLatest(
      epics[0](o),
      epics[1](o),
      epics[2](o),
      epics[3](o),
      epics[4](o))
  }
  else if (epics.length === 6) {
    return o => Observable.combineLatest(
      epics[0](o),
      epics[1](o),
      epics[2](o),
      epics[3](o),
      epics[4](o),
      epics[5](o))
  }
  else if (epics.length === 7) {
    return o => Observable.combineLatest(
      epics[0](o),
      epics[1](o),
      epics[2](o),
      epics[3](o),
      epics[4](o),
      epics[5](o),
      epics[6](o))
  }
  else if (epics.length === 8) {
    return o => Observable.combineLatest(
      epics[0](o),
      epics[1](o),
      epics[2](o),
      epics[3](o),
      epics[4](o),
      epics[5](o),
      epics[6](o),
      epics[7](o))
  }
  else {
    throw new Error('Illegal number of epics: ' + epics.length)
  }
}

export function foldEpics(...epics: Array<Epic<any,any>>): Epic<any,any> {
  return observable => epics.reduce((obs, epic) => epic(obs), observable)
}
