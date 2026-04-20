import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import userSliceReducer from './userSlice';
import tripSliceReducer from './tripSlice';
import themeSliceReducer from './themeSlice';
import { userApi } from '../service/userApi';
import { authApi } from '../service/authApi';
import { tripApi } from '../service/tripApi';
import notificationSliceReducer from './notificationSlice';
import { sosApi } from '../service/sosApi';
import { referralApi } from '../service/referralApi';
import { couponApi } from '../service/couponApi';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['userSlice', 'notifications', 'theme'], // slices you want to persist
};

const rootReducer = combineReducers({
  userSlice: userSliceReducer,
  tripSlice: tripSliceReducer,
  notifications: notificationSliceReducer,
  theme: themeSliceReducer,
  [userApi.reducerPath]: userApi.reducer, // RTK Query reducer
  [authApi.reducerPath]: authApi.reducer,
  [tripApi.reducerPath]: tripApi.reducer,
  [sosApi.reducerPath]: sosApi.reducer,
  [referralApi.reducerPath]: referralApi.reducer,
  [couponApi.reducerPath]: couponApi.reducer,

});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Important for redux-persist
    }).concat(userApi.middleware, authApi.middleware, tripApi.middleware, sosApi.middleware, referralApi.middleware, couponApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
