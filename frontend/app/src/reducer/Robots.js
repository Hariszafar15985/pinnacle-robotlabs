import service from "../services/Robots";
import { actions as appActions } from "./App";

export const initialState = {
    rawRobotData: null,
    robotData: null,
    loaded: false,
    premadePortfolios: null,
    premadePortfoliosLoaded: false,
    selectedPremadePortfolios: [],
    trendingLoaded: false,
    trendingRobots: [],
    categories: [],
    selectedRobots: [],
    selectedFilters: ['all'],
    error: false,
};

const SET_RAW_ROBOT_DATA = "SET_RAW_ROBOT_DATA";
const SET_ROBOTS = "SET_ROBOTS";
const SET_TRENDING_ROBOTS = "SET_TRENDING_ROBOTS";
const SET_CATEGORIES = "SET_CATEGORIES";
const SELECT_ROBOTS = "SELECT_ROBOTS";
const SET_ROBOTS_LOADED = "SET_ROBOTS_LOADED";
const SET_TRENDING_ROBOTS_LOADED = "SET_TRENDING_ROBOTS_LOADED";
const SET_FILTERS = "SET_FILTERS";
const SET_ERROR = "SET_ERROR";
const SET_PREMADE_PORTFOLIOS = "SET_PREMADE_PORTFOLIOS";
const SET_PREMADE_PORTFOLIOS_LOADED = "SET_PREMADE_PORTFOLIOS_LOADED";
const SET_SELECTED_PREMADE_PORTFOLIOS = "SET_SELECTED_PREMADE_PORTFOLIOS";


function categorizeRobots(robots, categories) {
    let categorizedRobots = {};
    for (let robot of robots) {
        if (categorizedRobots[robot.category] == null) categorizedRobots[robot.category] = [];
        robot.instrumentData = setInstrumentData(robot.instruments);
        robot.selectedInstrument = [];
        categorizedRobots[robot.category].push(robot);
    }
    // console.log('///categorizedRobots', categorizedRobots);
    return categorizedRobots;
}

const setInstrumentData = (instruments) => {
    let data = {};
    if (instruments && instruments.length > 0) {
        const ins1 = instruments[0].name;
        const ins2 = instruments[1]?.name;
        if (ins1) data[ins1] = 1;
        if (ins2) data[ins2] = 1;
    }
    else data = null;

    return data;
}

async function get(dispatch, state, version) {
    dispatch.robots({ type: SET_ROBOTS_LOADED, data: false });
    dispatch.robots({ type: SET_RAW_ROBOT_DATA, payload: null });
    dispatch.robots({ type: SET_ROBOTS, data: null });
    dispatch.robots({ type: SELECT_ROBOTS, selectedRobots: [] });

    try {
        const { data } = version === 'pro' ? await service.getProBots() : await service.get();
        const { data: categoriesData } = await service.getCategories();
        let robots = appActions.reformatProductData(data);

        let categorizedRobots = categorizeRobots(robots, categoriesData);
        dispatch.robots({ type: SET_ROBOTS_LOADED, data: true });
        dispatch.robots({ type: SET_RAW_ROBOT_DATA, payload: robots });
        dispatch.robots({ type: SET_ROBOTS, data: categorizedRobots });
        dispatch.robots({ type: SET_CATEGORIES, payload: categoriesData });
    } catch (e) {
        dispatch.robots({ type: SET_ROBOTS_LOADED, payload: false });
        dispatch.robots({ type: SET_ERROR, payload: true });
    }
}

async function getTrendingRobots(dispatch) {
    try {
        const { data } = await service.getTrendingRobots();
        let trendingRobots = appActions.reformatProductData(data);

        dispatch.robots({ type: SET_TRENDING_ROBOTS_LOADED, payload: true });
        dispatch.robots({ type: SET_TRENDING_ROBOTS, payload: trendingRobots });
    } catch (e) {
        dispatch.robots({ type: SET_TRENDING_ROBOTS_LOADED, payload: false });
        dispatch.robots({ type: SET_ERROR, payload: true });
    }
}

async function getPremadePortfolios(dispatch) {
    try {
        const { data } = await service.getPremadePortfolios();
        dispatch.robots({ type: SET_PREMADE_PORTFOLIOS_LOADED, payload: true });
        dispatch.robots({ type: SET_PREMADE_PORTFOLIOS, payload: data });
    } catch (e) {
        dispatch.robots({ type: SET_PREMADE_PORTFOLIOS_LOADED, payload: false });
        dispatch.robots({ type: SET_ERROR, payload: true });
    }
}

function select(dispatch, state, robot, instrumentName) {
    const id = robot.id;

    // Update selectedRobots
    let indexRobot = state.robots.selectedRobots.findIndex(robot => robot.id === id);

    let selectedRobots = [...state.robots.selectedRobots];
    if (indexRobot >= 0) {
        const indexInstrument = selectedRobots[indexRobot].selectedInstrument.indexOf(instrumentName);
        if (indexInstrument >= 0) {
            selectedRobots[indexRobot].selectedInstrument.splice(indexInstrument, 1);
            if (selectedRobots[indexRobot].selectedInstrument.length < 1) selectedRobots.splice(indexRobot, 1);
        }
        else {
            selectedRobots[indexRobot].selectedInstrument.push(instrumentName);
        }
    } else {
        robot.selectedInstrument.push(instrumentName);
        selectedRobots.push(robot);
    }

    dispatch.robots({ type: SELECT_ROBOTS, selectedRobots });
    state.robots.selectedRobots = selectedRobots; // overwrite to use immediately
    // console.log('///selectedRobots', selectedRobots);

    // Deselect any selected Pre-made Portfolio
    dispatch.robots({ type: SET_SELECTED_PREMADE_PORTFOLIOS, payload: [] });
    state.robots.selectedPremadePortfolios = []; // overwrite to use immediately
}

function selectPremadePortfolio(dispatch, state, portfolio) {
    let index = state.robots.selectedPremadePortfolios.indexOf(portfolio.id);
    let selectedPremadePortfolios = [...state.robots.selectedPremadePortfolios];

    const robotData = { ...state.robots.robotData };
    let allRobots = [];
    Object.keys(robotData).forEach(function (key, index) {
        const robotsOfCategory = robotData[key];
        allRobots = [...allRobots, ...robotsOfCategory];
    });

    if (index >= 0) {
        selectedPremadePortfolios.splice(index, 1);
        allRobots.forEach(robot => robot.selectedInstrument = []);
        dispatch.robots({ type: SELECT_ROBOTS, selectedRobots: [] });
        state.robots.selectedRobots = []; // overwrite to use immediately
    } else {
        selectedPremadePortfolios = [portfolio.id];
        let selectedRobots = [];
        if (robotData && portfolio.robots?.length > 0) {
            const robotsFromPortfolio = [...portfolio.robots];
            const robotIdsFromPortfolio = portfolio.robots.map(robot => robot.id);
            selectedRobots = allRobots.map(robot => {
                if (!robotIdsFromPortfolio.includes(robot.id)) return null;
                const foundRobotsFromPortfolio = robotsFromPortfolio.filter(rb => rb.id === robot.id);

                let updatedRobot = { ...robot };
                foundRobotsFromPortfolio.forEach(foundRobotFromPortfolio => {
                    const market = foundRobotFromPortfolio?.market ? foundRobotFromPortfolio.market : [];
                    if (updatedRobot.selectedInstrument.indexOf(market) === -1) {
                        updatedRobot.selectedInstrument.push(market);
                    }
                    updatedRobot.instrumentData[market] = foundRobotFromPortfolio.number_of_contract;
                })
                return updatedRobot;
            })
        }
        selectedRobots = selectedRobots.filter(Boolean);

        dispatch.robots({ type: SELECT_ROBOTS, selectedRobots });
        state.robots.selectedRobots = selectedRobots; // overwrite to use immediately

    }

    dispatch.robots({ type: SET_SELECTED_PREMADE_PORTFOLIOS, payload: selectedPremadePortfolios });
    state.robots.selectedPremadePortfolios = selectedPremadePortfolios; // overwrite to use immediately
}


function getRobotsFromCategory(dispatch, state, group) {
    if (group !== "Trending") {
        let allRobots = state.robots.robotData;
        if (allRobots && allRobots[group] != null) {
            let robotsOfGroup = allRobots[group];
            if (state.robots.selectedFilters.includes('all')) return robotsOfGroup;
            else if (state.robots.selectedFilters && state.robots.selectedFilters.length > 0) {
                // const checkIfInclusion = (arr1, arr2) => (arr1.some(r => arr2.includes(r)));
                const checkIfInclusion = (arr1, arr2) => (arr1.some(r => arr2.includes(r.name)));
                robotsOfGroup = robotsOfGroup.filter(robot => checkIfInclusion(robot.instruments, state.robots.selectedFilters));
            }

            return robotsOfGroup;
        }

        return [];
    }
    else {
        let all = state.robots.trendingRobots;
        if (all && all.length > 0) {
            let robots = [...all];
            if (state.robots.selectedFilters.includes('all')) return robots;
            else if (state.robots.selectedFilters && state.robots.selectedFilters.length > 0) {
                const checkIfInclusion = (arr1, arr2) => (arr1.some(r => arr2.includes(r)));
                robots = robots.filter(robot => checkIfInclusion(robot.instruments, state.robots.selectedFilters));
            }

            return robots;
        }

        return [];
    }
}

function deSelectAll(dispatch) {
    dispatch.robots({ type: SELECT_ROBOTS, selectedRobots: [] });
}

function setSelectedFilters(dispatch, state, filters) {
    dispatch.robots({ type: SET_FILTERS, payload: filters });
}

function setNumberOfContractForRobot(dispatch, state, robot, instrumentName, numberOfContract) {
    let robotData = state.robots.robotData;
    const category = robot.category;
    const id = robot.id;
    let robotsOfCategory = [...robotData[category]];
    let foundRobotIndex = robotsOfCategory?.findIndex(rb => rb.id === id);
    if (foundRobotIndex != null) {
        robotsOfCategory[foundRobotIndex].instrumentData[instrumentName] = numberOfContract;
        robotData[category] = robotsOfCategory;
        dispatch.robots({ type: SET_ROBOTS, data: robotData });
    }
}

export const actions = {
    get,
    getTrendingRobots,
    select,
    getRobotsFromCategory,
    deSelectAll,
    setSelectedFilters,
    setNumberOfContractForRobot,
    getPremadePortfolios,
    selectPremadePortfolio
};

export function reducer(state, action) {
    switch (action.type) {
        case SET_RAW_ROBOT_DATA:
            return { ...state, rawRobotData: action.payload };
        case SET_ROBOTS:
            return { ...state, robotData: action.data };
        case SET_ROBOTS_LOADED:
            return { ...state, loaded: action.data };
        case SET_PREMADE_PORTFOLIOS:
            return { ...state, premadePortfolios: action.payload };
        case SET_PREMADE_PORTFOLIOS_LOADED:
            return { ...state, premadePortfoliosLoaded: action.payload };
        case SET_TRENDING_ROBOTS:
            return { ...state, trendingRobots: action.payload };
        case SET_CATEGORIES:
            return { ...state, categories: action.payload };
        case SET_TRENDING_ROBOTS_LOADED:
            return { ...state, trendingLoaded: action.payload };
        case SELECT_ROBOTS:
            return { ...state, selectedRobots: action.selectedRobots };
        case SET_FILTERS:
            return { ...state, selectedFilters: action.payload };
        case SET_ERROR:
            return { ...state, error: action.payload };
        case SET_SELECTED_PREMADE_PORTFOLIOS:
            return { ...state, selectedPremadePortfolios: action.payload };
        default:
            return state;
    }
}
