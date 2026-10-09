import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import { call, put, takeEvery } from 'redux-saga/effects'
import { t } from '@/localization'
import { enqueueSnackbar } from '@/redux/modules/snackbar/slice'
import { openWeb } from './slice'

export function* inAppBrowserSaga() {
  yield takeEvery(openWeb, openWebSaga)
}

function* openWebSaga({ payload }: ReturnType<typeof openWeb>) {
  try {
    yield call(InAppBrowser.open, payload)
  } catch (e: any) {
    console.warn('openWebSaga', e)
    yield put(
      enqueueSnackbar({
        message: t('app_could_not_open_the_web_browser'),
      }),
    )
  }
}
