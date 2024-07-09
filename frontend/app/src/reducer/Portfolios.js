import portfoliosService from "../services/Portfolios";
import addonsService from "../services/Addons";
import { SET_ADDONS, SET_ADDONS_LOADED } from "./Addons";
import { actions as appActions } from "./App";

export const initialState = {
  all: [],
  loaded: false,
  selected: null,
};

const SET_PORTFOLIOS = "SET_PORTFOLIOS";
const SELECT_PORTFOLIO = "SELECT_PORTFOLIO";
const SET_PORTFOLIOS_LOADED = "SET_PORTFOLIOS_LOADED";

async function getPortfoliosAndAddons(dispatch) {
  let result = [];
  result.push(portfoliosService.get(), addonsService.get());
  let data = await Promise.all(result);
  let portfolios = appActions.reformatProductData(data[0].data.products);
  let addons = appActions.reformatProductData(data[1].data.products);
  dispatch.portfolios({ type: SET_PORTFOLIOS, data: portfolios });
  dispatch.portfolios({ type: SET_PORTFOLIOS_LOADED, data: true });
  dispatch.addons({ type: SET_ADDONS_LOADED, data: true });
  dispatch.addons({ type: SET_ADDONS, data: addons });
}

function select(dispatch, state, sku) {
  let selected = sku;

  if (state.portfolios.selected === sku) {
    if (state.app.tour >= 1) {
      return;
    }
    selected = null;
  }
  dispatch.portfolios({ type: SELECT_PORTFOLIO, selected });
  state.portfolios.selected = selected; // overwrite to use immediately
  if (!state.app.tour) appActions.reloadSimulationData(dispatch, state);
}

function deSelectAll(dispatch, state) {
  dispatch.portfolios({ type: SELECT_PORTFOLIO, selected: null });
}

function getBySku(dispatch, state, sku) {
  for (let portfolio of state.portfolios.all) {
    if (portfolio.sku === sku) {
      return portfolio;
    }
  }
  return null;
}

export const actions = {
  getPortfoliosAndAddons,
  select,
  getBySku,
  deSelectAll,
};

export function reducer(state, action) {
  switch (action.type) {
    case SET_PORTFOLIOS:
      return { ...state, all: action.data };
    case SET_PORTFOLIOS_LOADED:
      return { ...state, loaded: action.data };
    case SELECT_PORTFOLIO:
      return { ...state, selected: action.selected };
    default:
      return state;
  }
}
