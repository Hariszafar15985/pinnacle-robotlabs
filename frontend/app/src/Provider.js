import {createContext, useReducer} from "react";
import {initialState as initialPortfoliosState, actions as portfoliosActions,
  reducer as portfoliosReducer} from './reducer/Portfolios';
import {initialState as initialAddonsState, actions as addonsActions,
  reducer as addonsReducer} from './reducer/Addons';
import {initialState as initialAppState, actions as appActions,
  reducer as appReducer} from './reducer/App';
import {initialState as initialRobotsState, actions as robotsActions,
  reducer as robotsReducer} from './reducer/Robots';

export const AppContext = createContext();
export default function Provider({ children }) {
  const [appState, appDispatch] = useReducer(appReducer, initialAppState);
  const [portfoliosState, portfoliosDispatch] = useReducer(portfoliosReducer, initialPortfoliosState);
  const [addonsState, addonsDispatch] = useReducer(addonsReducer, initialAddonsState);
  const [robotsState, robotsDispatch] = useReducer(robotsReducer, initialRobotsState);

  const fullState = {app: appState, portfolios: portfoliosState, addons: addonsState, robots:robotsState};
  const fullDispatch = {
    app: appDispatch,
    portfolios: portfoliosDispatch,
    addons: addonsDispatch,
    robots: robotsDispatch
  };

  const value = {
    app: {
      ...appState,
      ...bindActions(appActions, fullDispatch, fullState)
    },
    portfolios: {
      ...portfoliosState,
      ...bindActions(portfoliosActions, fullDispatch, fullState)
    },
    addons: {
      ...addonsState,
      ...bindActions(addonsActions, fullDispatch, fullState)
    },
    robots: {
      ...robotsState,
      ...bindActions(robotsActions, fullDispatch, fullState)
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}


// Expose dispatch and state to action functions
function bindActions(actions, dispatch, state) {
  let result = {};
  for(let actionName in actions) {
    result[actionName] = (...args) => {
      return actions[actionName](dispatch, state, ...args)
    };
  }
  return result;
}