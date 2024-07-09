import { actions as appActions } from "./App";

export const initialState = {
  all: [],
  loaded: false,
  selected: [],
};

export const SET_ADDONS = "SET_ADDONS";
const SELECT_ADDON = "SELECT_ADDON";
export const SET_ADDONS_LOADED = "SET_ADDONS_LOADED";

function select(dispatch, state, sku) {
  let index = state.addons.selected.indexOf(sku);
  let selected = [...state.addons.selected];
  if (index >= 0) {
    if (state.app.tour >= 1) return;
    selected.splice(index, 1);
  } else {
    selected.push(sku);
  }
  dispatch.addons({ type: SELECT_ADDON, selected });
  state.addons.selected = selected; // overwrite to use immediately
  if (!state.app.tour) appActions.reloadSimulationData(dispatch, state);
}

function deSelectAll(dispatch) {
  dispatch.addons({ type: SELECT_ADDON, selected: [] });
}

function getBySku(dispatch, state, sku) {
  for (let addon of state.addons.all) {
    if (addon.sku === sku) return addon;
  }
  return null;
}

function getBySkus(dispatch, state, skus) {
  let result = [];
  for (let sku of skus) {
    let addon = getBySku(dispatch, state, sku);
    if (addon) result.push(addon);
  }
  return result;
}

export const actions = { select, getBySku, getBySkus, deSelectAll };

export function reducer(state, action) {
  switch (action.type) {
    case SET_ADDONS:
      return { ...state, all: action.data };
    case SET_ADDONS_LOADED:
      return { ...state, loaded: action.data };
    case SELECT_ADDON:
      return { ...state, selected: action.selected };
    default:
      return state;
  }
}
