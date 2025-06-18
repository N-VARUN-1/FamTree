// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage'; // uses localStorage by default

// 1. persist config
const persistConfig = {
    key: 'root',
    storage,
};

// 2. Wrap your reducer
const persistedUserReducer = persistReducer(persistConfig, userReducer);

// 3. Configure store
const store = configureStore({
    reducer: {
        user: persistedUserReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// 4. Export persistor
export const persistor = persistStore(store);
export default store;
