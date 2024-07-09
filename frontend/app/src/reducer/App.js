import { cloneDeep } from "lodash";

import { numberWithCommas } from "../helpers/number";
// import { getQueryParamValue } from "../helpers/url";
import getDummySimulationData, {
    dummySimulationFields
} from "../services/DummySimulationData";
import portfoliosService from "../services/Portfolios";
import robotsService from "../services/Robots";
import { actions as addonsActions } from "./Addons";
import { actions as portfoliosActions } from "./Portfolios";
import { actions as robotsActions } from "./Robots";

const defaultNotification = {
    title: null,
    description: null,
    type: null,
};

export const initialState = {
    notification: defaultNotification,
    currentVersion: 'normal',
    cartType: "quarter",
    numberOfMonths: 12,
    simulationFields: null,
    simulationData: [],
    simulationDataLoading: false,
    chartData: [],
    portfolioType: "custom", // force custom type
    menuOpen: false,
    step: 1,
    subTotal: 0,
    discount: 0,
    price: null,
    lastDiscount: 0,
    tour: 0, // different states of tour
    showRobotModal: false,
    showRobotPortfolioModal: false,
    showMessageModal: false,
    showSignalInfoModal: false,
    showBotPortfolioModal: false,
    showCommissionModal: false,
    commissionData: null,
    selectedCommission: null,
    openCartButtonActive: false,
    showHintRobotButton: true,
    instrumentData: null,
    chartType: 'cumulative-net-profit',
    chartSubtype: 'portfolio',
    chartInterval: 'month',
    triggerApiCall: false,
    calculationApiResponse: null,
    error: null
};

const SET_NOTIFICATION = "SET_NOTIFICATION";
const RESET_NOTIFICATION = "RESET_NOTIFICATION";
const SET_CURRENT_VERSION = "SET_CURRENT_VERSION";
const SET_CART_TYPE = "SET_CART_TYPE";
const SET_NUMBER_OF_MONTHS = "SET_NUMBER_OF_MONTHS";
const SET_SIMULATION_FIELDS = "SET_SIMULATION_FIELDS";
const SET_SIMULATION_DATA = "SET_SIMULATION_DATA";
const SET_CHART_DATA = "SET_CHART_DATA";
const SET_SIMULATION_DATA_LOADING = "SET_SIMULATION_DATA_LOADING";
const SET_PORTFOLIO_TYPE = "SET_PORTFOLIO_TYPE";
const TOGGLE_MENU = "TOGGLE_MENU"; // use for mobile
const SET_STEP = "SET_STEP"; // use for mobile
const SET_SUB_TOTAL = "SET_SUB_TOTAL"; // use for cart
export const SET_PRICE = "SET_PRICE";
export const SET_LAST_DISCOUNT = "SET_LAST_DISCOUNT"; // use to trigger discount notification
const SET_DISCOUNT = "SET_DISCOUNT";
const SET_TOUR = "SET_TOUR";
const SET_SHOW_ROBOT_MODAL = "SET_SHOW_ROBOT_MODAL";
const SET_SHOW_ROBOT_PORTFOLIO_MODAL = "SET_SHOW_ROBOT_PORTFOLIO_MODAL";
const SET_SHOW_MESSAGE_MODAL = "SET_SHOW_MESSAGE_MODAL";
const SET_SHOW_SIGNAL_INFO_MODAL = "SET_SHOW_SIGNAL_INFO_MODAL";
const SET_SHOW_HINT_ROBOT_BUTTON = "SET_SHOW_HINT_ROBOT_BUTTON";
const SET_INSTRUMENT_DATA = "SET_INSTRUMENT_DATA";
const SET_SHOW_COMMISSION_MODAL = "SET_SHOW_COMMISSION_MODAL";
const SET_COMMISSION_DATA = "SET_COMMISSION_DATA";
const SET_CHART_TYPE = "SET_CHART_TYPE";
const SET_CHART_SUBTYPE = "SET_CHART_SUBTYPE";
const SET_CHART_INTERVAL = "SET_CHART_INTERVAL";
const SET_TRIGGER_API_CALL = "SET_TRIGGER_API_CALL";
const SET_CALCULATION_API_RESPONSE = "SET_CALCULATION_API_RESPONSE";
const SET_APP_ERROR = "SET_APP_ERROR";

function setCurrentVersion(dispatch, state, version) {
    if (state.app.currentVersion !== version) {
        dispatch.app({ type: SET_CURRENT_VERSION, payload: version });
    }
}

function setTour(dispatch, state, tour) {
    if (tour === 0) {
        portfoliosActions.deSelectAll(dispatch, state);
        addonsActions.deSelectAll(dispatch, state);
    }
    dispatch.app({ type: SET_TOUR, tour });
}

function setShowRobotModal(dispatch, state, value) {
    dispatch.app({ type: SET_SHOW_ROBOT_MODAL, showRobotModal: value });
}

function setShowRobotPortfolioModal(dispatch, state, value) {
    dispatch.app({
        type: SET_SHOW_ROBOT_PORTFOLIO_MODAL,
        payload: value,
    });
}

function setShowMessageModal(dispatch, state, value) {
    dispatch.app({
        type: SET_SHOW_MESSAGE_MODAL,
        showMessageModal: value,
    });
}

function setShowSignalInfoModal(dispatch, state, value) {
    dispatch.app({
        type: SET_SHOW_SIGNAL_INFO_MODAL,
        payload: value,
    });
}

async function setNotification(dispatch, state, notification) {
    dispatch.app({ type: SET_NOTIFICATION, notification });
    setTimeout(() => {
        dispatch.app({ type: RESET_NOTIFICATION, defaultNotification });
    }, 6000);
}

async function resetNotification(dispatch, state) {
    dispatch.app({ type: RESET_NOTIFICATION, defaultNotification });
}

function setCartType(dispatch, state, cartType) {
    if (state.app.cartType === cartType) return;

    state.app.cartType = cartType; // modify directly to use right away
    setSubTotal(dispatch, state);
    dispatch.app({ type: SET_CART_TYPE, cartType });
}

function setNumberOfMonths(dispatch, state, numberOfMonths, reload = false) {
    if (state.app.numberOfMonths === numberOfMonths) return;
    dispatch.app({ type: SET_NUMBER_OF_MONTHS, numberOfMonths });
}

function setPortfolioType(dispatch, state, portfolioType) {
    // reset chart data when switch between pre-made and custom
    if (state.app.portfolioType !== portfolioType) {
        setInitialStatisticData(dispatch);
        dispatch.app({ type: SET_PORTFOLIO_TYPE, portfolioType });
    }

    if (portfolioType === "preMade") {
        robotsActions.deSelectAll(dispatch, state);
    } else {
        portfoliosActions.deSelectAll(dispatch, state);
        addonsActions.deSelectAll(dispatch, state);
    }
}

// Set step for mobile
function setStep(dispatch, state, step) {
    dispatch.app({ type: SET_STEP, step });
}

function setInitialStatisticData(dispatch) {
    dispatch.app({ type: SET_SIMULATION_DATA, simulationData: [] });
    dispatch.app({ type: SET_CHART_DATA, chartData: [] });
}

const reloadSimulationData = async (dispatch, state, chartType, chartSubtype, chartInterval) => {
    if (!state.robots.selectedRobots.length) {
        setInitialStatisticData(dispatch);
        return;
    }

    dispatch.app({ type: SET_SIMULATION_DATA_LOADING, data: true });
    let simulationFields = state.app.simulationFields;
    let result = [];

    if (state.app.triggerApiCall) {
        let robots = [];
        const selectedRobots = [...state.robots.selectedRobots];
        robots = selectedRobots.map(robot => {
            let instruments = { ...robot.instrumentData };
            Object.keys(instruments).forEach(key => {
                if (!robot.selectedInstrument.includes(key)) delete instruments[key];
            });
            return {
                sku: robot.sku,
                instruments,
            }
        })

        let commissionData = {};
        state.app.commissionData.forEach(comm => {
            commissionData[comm.name] = comm.selectedLevel;
        })

        result = [
            robotsService.getSimulationData(
                state.app.numberOfMonths ? state.app.numberOfMonths : 12,
                robots,
                commissionData
            ),
        ];

        if (!simulationFields) {
            result.push(portfoliosService.getSimulationFields());
        }
    }

    try {
        let data = [];
        if (state.app.triggerApiCall) {
            data = await Promise.all(result);
            dispatch.app({ type: SET_CALCULATION_API_RESPONSE, payload: data });
        } else {
            data = state.app.calculationApiResponse;
        }

        if (!simulationFields) {
            simulationFields = data[1].data;
            dispatch.app({ type: SET_SIMULATION_FIELDS, simulationFields });
        }
        let simulationData = reformatSimulationData(simulationFields, data[0].data);
        dispatch.app({ type: SET_SIMULATION_DATA, simulationData });

        let chartData = data && data[0] && data[0].data ? reformatChartData(data[0].data, chartType ? chartType : state.app.chartType, chartSubtype ? chartSubtype : state.app.chartSubtype, chartInterval ? chartInterval : state.app.chartInterval) : [];
        dispatch.app({ type: SET_CHART_DATA, chartData });
        dispatch.app({ type: SET_SIMULATION_DATA_LOADING, data: false });
        dispatch.app({ type: SET_TRIGGER_API_CALL, payload: true });
    } catch (e) {
        dispatch.app({ type: SET_SIMULATION_DATA_LOADING, data: false });
        setInitialStatisticData(dispatch);
        console.error("Error: ", e);
        dispatch.robots({ type: SET_APP_ERROR, payload: e });
    }
};

const reloadSimulationDataInTour = async (dispatch, state, step) => {
    if (
        state.app.portfolioType === "preMade" &&
        state.app.tour !== 1.1 &&
        state.app.tour !== 3
    )
        return;
    else if (state.app.portfolioType === "custom" && state.app.tour === 2) return;

    dispatch.app({ type: SET_SIMULATION_DATA_LOADING, data: true });
    if (state.app.tour === 1.1 || state.app.tour === 2) {
        setInitialStatisticData(dispatch);
        dispatch.app({ type: SET_SIMULATION_FIELDS, dummySimulationFields });
    }

    let dummySimulationData = await getDummySimulationData({
        portfolioType: state.app.portfolioType,
        step: step,
    });

    let simulationData = reformatSimulationData(
        dummySimulationFields,
        dummySimulationData
    );
    dispatch.app({ type: SET_SIMULATION_DATA, simulationData });

    let chartData = reformatChartData(dummySimulationData);
    dispatch.app({ type: SET_CHART_DATA, chartData });
    dispatch.app({ type: SET_SIMULATION_DATA_LOADING, data: false });
};

function reformatChartData(data, chartType = 'cumulative-net-profit', chartSubtype = 'portfolio', interval = 'month') {
    let field = '';
    let chartData = [];

    switch (chartType) {
        case 'net-profit':
            field = 'net_profit';
            if (interval === 'day') chartData = data[field]['daily_net'];
            if (interval === 'week') chartData = data[field]['weekly_net'];
            if (interval === 'month') chartData = data[field]['monthly_net'];
            break;
        case 'drawdown':
            field = 'drawdown';
            if (interval === 'day') chartData = data[field]['drawdown_daily'];
            if (interval === 'week') chartData = data[field]['drawdown_weekly'];
            if (interval === 'month') chartData = data[field]['drawdown_monthly'];
            break;
        case 'cumulative-drawdown':
            field = 'drawdown';
            chartData = chartSubtype === 'portfolio' ? data[field]['drawdown_cum_monthly'] : data[field]['individual'];
            break;
        case 'cumulative-net-profit':
            field = 'cum_profit';
            chartData = chartSubtype === 'portfolio' ? data[field]['monthly'] : data[field]['individual'];
            break;
        default:
            chartData = data[field];
            break;
    }

    // let result = [];
    // for (let data of chartData) {
    //     result.push(data);
    // }

    const result = cloneDeep(chartData);

    return result;
}

function reformatSimulationData(fields, data) {
    let result = [];
    for (let field in fields) {
        if (['Ulcer index', 'Probability', 'Total slippage'].includes(fields[field])) continue;

        let fieldName = fields[field];
        let allTrades = numberWithCommas(data["all_trades"][field]);
        let longTrades = numberWithCommas(data["long_trades"][field]);
        let shortTrades = numberWithCommas(data["short_trades"][field]);
        result.push([fieldName, allTrades, longTrades, shortTrades]);
    }

    return result;
}

function toggleMenu(dispatch, state) {
    let showMenu = !state.app.menuOpen;
    dispatch.app({ type: TOGGLE_MENU, data: showMenu });
}

function setSubTotal(dispatch, state) {
    let subTotal = 0;
    setDiscount(dispatch, state);

    if (state.app.portfolioType === "preMade") {
        let selectedPortfolio = portfoliosActions.getBySku(
            dispatch,
            state,
            state.portfolios.selected
        );
        if (selectedPortfolio) {
            subTotal =
                state.app.cartType === "quarter"
                    ? selectedPortfolio.quarter
                    : selectedPortfolio.year;
        }

        let selectedAddons = [];
        for (let addonSku of state.addons.selected) {
            let addon = addonsActions.getBySku(dispatch, state, addonSku);
            selectedAddons.push(addon);
            subTotal += state.app.cartType === "quarter" ? addon.quarter : addon.year;
        }

        dispatch.app({ type: SET_SUB_TOTAL, subTotal });
        return subTotal;
    }

    // custom portfolio case
    let selectedRobotSkus = state.robots.selectedRobotSkus;
    let selectedRobots = robotsActions.getBySkus(
        dispatch,
        state,
        selectedRobotSkus
    );
    if (selectedRobots.length) {
        for (let robot of selectedRobots) {
            subTotal += state.app.cartType === "quarter" ? robot.quarter : robot.year;
        }
    }
    dispatch.app({ type: SET_SUB_TOTAL, subTotal });
    return subTotal;
}

function setDiscount(dispatch, state) {
    if (state.app.portfolioType === "preMade") {
        dispatch.app({ type: SET_DISCOUNT, discount: 0 });
    }

    let discount = 0;
    if (state.robots.selectedRobotSkus.length >= 23) {
        discount = 0.5;
    } else if (state.robots.selectedRobotSkus.length >= 15) {
        discount = 0.4;
    } else if (state.robots.selectedRobotSkus.length >= 11) {
        discount = 0.3;
    } else if (state.robots.selectedRobotSkus.length >= 7) {
        discount = 0.2;
    } else if (state.robots.selectedRobotSkus.length >= 4) {
        discount = 0.1;
    }

    dispatch.app({ type: SET_DISCOUNT, discount });
}

function reformatProductData(products) {
    let result = [];
    for (let product of products) {
        product["title"] = htmlDecode(product.title);
        product["quarter"] = findQuarterlyPlan(product.plans);
        product["year"] = findYearlyPlan(product.plans);
        result.push(product);
    }
    return result;
}

function findQuarterlyPlan(plans) {
    if (!plans || plans.length < 1) return 0;
    for (let plan of plans) {
        // eslint-disable-next-line eqeqeq
        if (plan.period === "month" && plan.interval == 3)
            return parseFloat(plan.price);
    }
    return 0;
}

function findYearlyPlan(plans) {
    if (!plans || plans.length < 1) return 0;
    for (let plan of plans) {
        // eslint-disable-next-line eqeqeq
        if (plan.period === "year" && plan.interval == 1)
            return parseFloat(plan.price);
    }
    return 0;
}

function htmlDecode(input) {
    var e = document.createElement("textarea");
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function checkOut(dispatch, state) {
    let url = "https://eminibots.com/checkout?product_skus=";
    let subscriptionType =
        state.app.cartType === "quarter" ? "3_month" : "1_year";

    if (state.app.portfolioType === "preMade") {
        if (!state.portfolios.selected) return;
        url += state.portfolios.selected + "," + subscriptionType;
        for (let addonSku of state.addons.selected) {
            url += ";" + addonSku + "," + subscriptionType;
        }
    } else {
        if (!state.robots.selectedRobotSkus.length) return;
        let list_uri = [];
        for (let i = 0; i < state.robots.selectedRobotSkus.length; i++) {
            let sku = state.robots.selectedRobotSkus[i];
            const robot = sku + "," + subscriptionType;
            list_uri.push(robot);
        }
        const uri = list_uri.join(";");
        url += uri;
    }
    window.location = url;
}

function setShowHintRobotButton(dispatch, state, value) {
    dispatch.app({
        type: SET_SHOW_HINT_ROBOT_BUTTON,
        showHintRobotButton: value,
    });
}

async function getInstrumentData(dispatch) {
    const { data } = await robotsService.getInstruments();
    dispatch.app({
        type: SET_INSTRUMENT_DATA,
        data: data,
    });
}

async function getCommissionData(dispatch) {
    let { data } = await robotsService.getCommission();
    if (data && data.length > 0) {
        data = data.map(type => (
            { ...type, selectedLevel: 1 }
        ))

        dispatch.app({
            type: SET_COMMISSION_DATA,
            payload: data,
        });
    }
}

function setShowCommissionModal(dispatch, state, value) {
    dispatch.app({
        type: SET_SHOW_COMMISSION_MODAL,
        payload: value,
    });
}

function setCommissionLevel(dispatch, state, itemIndex, selectedLevel) {
    let data = [...state.app.commissionData];
    data[itemIndex].selectedLevel = selectedLevel;

    dispatch.app({
        type: SET_COMMISSION_DATA,
        payload: data,
    });
}

function setChartType(dispatch, state, value) {
    dispatch.app({ type: SET_CHART_TYPE, payload: value });
    reloadSimulationData(dispatch, state, value, undefined, undefined);
}

function setChartSubtype(dispatch, state, value) {
    dispatch.app({ type: SET_CHART_SUBTYPE, payload: value });
    reloadSimulationData(dispatch, state, undefined, value, undefined);
}

function setChartInterval(dispatch, state, value) {
    dispatch.app({ type: SET_CHART_INTERVAL, payload: value });
    reloadSimulationData(dispatch, state, undefined, undefined, value);
}

function setTriggerApiCall(dispatch, state, value) {
    dispatch.app({ type: SET_TRIGGER_API_CALL, payload: value });
}

export const actions = {
    setNotification,
    resetNotification,
    setCurrentVersion,
    setCartType,
    setNumberOfMonths,
    reloadSimulationData,
    reloadSimulationDataInTour,
    setPortfolioType,
    toggleMenu,
    setStep,
    setSubTotal,
    setDiscount,
    reformatProductData,
    checkOut,
    setTour,
    setShowRobotModal,
    setShowRobotPortfolioModal,
    setShowMessageModal,
    setShowSignalInfoModal,
    setShowHintRobotButton,
    getInstrumentData,
    getCommissionData,
    setShowCommissionModal,
    setCommissionLevel,
    setChartType,
    setChartSubtype,
    setChartInterval,
    setTriggerApiCall
};

export function reducer(state, action) {
    switch (action.type) {
        case SET_NOTIFICATION:
            return { ...state, notification: action.notification };
        case RESET_NOTIFICATION:
            return { ...state, notification: action.defaultNotification };
        case SET_CURRENT_VERSION:
            return { ...state, currentVersion: action.payload };
        case SET_CART_TYPE:
            return { ...state, cartType: action.cartType };
        case SET_NUMBER_OF_MONTHS:
            return { ...state, numberOfMonths: action.numberOfMonths };
        case SET_SIMULATION_FIELDS:
            return { ...state, simulationFields: action.simulationFields };
        case SET_SIMULATION_DATA:
            return { ...state, simulationData: action.simulationData };
        case SET_SIMULATION_DATA_LOADING:
            return { ...state, simulationDataLoading: action.data };
        case SET_CHART_DATA:
            return { ...state, chartData: action.chartData };
        case SET_PORTFOLIO_TYPE:
            return { ...state, portfolioType: action.portfolioType };
        case TOGGLE_MENU:
            return { ...state, menuOpen: action.data };
        case SET_STEP:
            return { ...state, step: action.step };
        case SET_SUB_TOTAL:
            return { ...state, subTotal: action.subTotal };
        case SET_PRICE:
            return { ...state, price: action.price };
        case SET_LAST_DISCOUNT:
            return { ...state, lastDiscount: action.lastDiscount };
        case SET_DISCOUNT:
            return { ...state, discount: action.discount };
        case SET_TOUR:
            return { ...state, tour: action.tour };
        case SET_SHOW_ROBOT_MODAL:
            return { ...state, showRobotModal: action.showRobotModal };
        case SET_SHOW_ROBOT_PORTFOLIO_MODAL:
            return { ...state, showRobotPortfolioModal: action.payload };
        case SET_SHOW_MESSAGE_MODAL:
            return {
                ...state,
                showMessageModal: action.showMessageModal,
            };
        case SET_SHOW_SIGNAL_INFO_MODAL:
            return { ...state, showSignalInfoModal: action.payload };
        case SET_SHOW_HINT_ROBOT_BUTTON:
            return {
                ...state,
                showHintRobotButton: action.showHintRobotButton,
            };
        case SET_INSTRUMENT_DATA:
            return { ...state, instrumentData: action.data };
        case SET_COMMISSION_DATA:
            return { ...state, commissionData: action.payload };
        case SET_SHOW_COMMISSION_MODAL:
            return { ...state, showCommissionModal: action.payload };
        case SET_CHART_TYPE:
            return { ...state, chartType: action.payload };
        case SET_CHART_SUBTYPE:
            return { ...state, chartSubtype: action.payload };
        case SET_CHART_INTERVAL:
            return { ...state, chartInterval: action.payload };
        case SET_TRIGGER_API_CALL:
            return { ...state, triggerApiCall: action.payload };
        case SET_CALCULATION_API_RESPONSE:
            return { ...state, calculationApiResponse: action.payload };
        case SET_APP_ERROR:
            return { ...state, error: action.payload };
        default:
            return state;
    }
}
