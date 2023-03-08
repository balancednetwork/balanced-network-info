/**
 * Create the store with dynamic reducers
 */

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createInjectorsEnhancer } from 'redux-injectors';
// import { load } from 'redux-localstorage-simple';
import createSagaMiddleware from 'redux-saga';

import application from './application/reducer';
import oracle from './oracle/reducer';
import { createReducer } from './reducers';

// const PERSISTED_KEYS: string[] = [];

export function configureAppStore() {
  const reduxSagaMonitorOptions = {};
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware];

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ];

  const store = configureStore({
    reducer: createReducer({
      application,
      oracle,
    }),
    middleware: [
      ...getDefaultMiddleware({
        serializableCheck: false,
      }),
      // save({ states: PERSISTED_KEYS }),
      ...middlewares,
    ],
    // preloadedState: load({ states: PERSISTED_KEYS }),
    devTools: process.env.NODE_ENV !== 'production',
    enhancers,
  });

  return store;
}
