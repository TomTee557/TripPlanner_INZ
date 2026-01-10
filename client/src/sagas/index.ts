import { all } from 'redux-saga/effects';
import authSaga from '@sagas/authSaga';
import tripsSaga from '@sagas/tripsSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    tripsSaga(),
  ]);
}
