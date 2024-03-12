import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import rootReducer from './rootReducer'
import storage from 'redux-persist/lib/storage'
import usdPriceReducer from './slices/usdPrice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

const reducer = combineReducers(rootReducer)

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'borrow', 'theme', 'home', 'layout'],
  blacklist: [usdPriceReducer.name],
}

const persistedReducer = persistReducer(persistConfig, reducer)
const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  reducer: persistedReducer,
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispath = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector

export const persistor = persistStore(store)
export default store
