import { call, put, takeEvery, takeLeading } from 'redux-saga/effects'
import {
  deletePrintData as deletePrintDataFromDatabase,
  findAllPrintData,
  getDatabase,
  type SqliteConnection,
  savePrintData as savePrintDataToDatabase,
} from '@/database'
import { t } from '@/localization'
import type { PrintData } from '@/print'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { createUUID } from '@/utils/uuid'
import {
  assignIsLoading,
  assignPrintData,
  deletePrintData,
  duplicatePrintData,
  fetchPrintData,
  printLayout,
  savePrintData,
} from '../slice'
import { printLayoutSaga } from './printLayout'

export function* printDataSaga() {
  yield takeLeading(fetchPrintData, fetchPrintDataSaga)
  yield takeEvery(savePrintData, savePrintDataSaga)
  yield takeEvery(duplicatePrintData, duplicatePrintDataSaga)
  yield takeEvery(deletePrintData, deletePrintDataSaga)
  yield takeLeading(printLayout, printLayoutSaga)
}

/**
 * SQLite を情報源として、Redux の写しを作り直す
 *
 * レイアウト側の操作でも印刷データが消えることがあるため、
 * `@package` として layoutSaga からも呼ぶ。
 *
 * @package
 */
export function* reloadPrintDataSaga() {
  const db: SqliteConnection = yield call(getDatabase)
  const values: PrintData[] = yield call(findAllPrintData, db)
  yield put(assignPrintData(values))
}

function* fetchPrintDataSaga() {
  try {
    yield put(assignIsLoading(true))
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('fetchPrintDataSaga', e)
    yield put(enqueueSnackbar({ message: t('app_could_not_load_print_data') }))
  } finally {
    yield put(assignIsLoading(false))
  }
}

function* savePrintDataSaga({ payload }: ReturnType<typeof savePrintData>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(savePrintDataToDatabase, db, payload)
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('savePrintDataSaga', e)
    yield put(enqueueSnackbar({ message: t('app_could_not_save_print_data') }))
  }
}

function* duplicatePrintDataSaga({
  payload,
}: ReturnType<typeof duplicatePrintData>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(savePrintDataToDatabase, db, {
      ...payload,
      id: createUUID(),
      title: t('app_value_copy', payload.title),
    })
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('duplicatePrintDataSaga', e)
    yield put(
      enqueueSnackbar({ message: t('app_could_not_duplicate_print_data') }),
    )
  }
}

function* deletePrintDataSaga({ payload }: ReturnType<typeof deletePrintData>) {
  try {
    const db: SqliteConnection = yield call(getDatabase)
    yield call(deletePrintDataFromDatabase, db, payload.id)
    yield call(reloadPrintDataSaga)
  } catch (e: any) {
    console.warn('deletePrintDataSaga', e)
    yield put(
      enqueueSnackbar({ message: t('app_could_not_delete_print_data') }),
    )
  }
}
