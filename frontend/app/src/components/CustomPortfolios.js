import { useContext, useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import Robots from "components/Robots";
import { AppContext } from "../Provider";
import { ReactComponent as ArrowDown } from "../images/cheveron-down.svg";
import { ReactComponent as LoadingIcon } from "../images/tail-spin.svg";
import PremadePortfolios from "./PremadePortfolios";


function CustomPortfolios() {
    const { app, robots } = useContext(AppContext);

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState([]);
    const [currentPortfolios, setCurrentPortfolios] = useState([]);

    const toggleFilters = () => {
        setShowFilters(prev => !prev);
    };

    const toggleBotPortfolio = () => {
        app.setShowRobotPortfolioModal(true);
    };

    const handleFilterSelected = (e, filter) => {
        e.stopPropagation();

        if (!robots.selectedFilters.includes(filter)) {
            if (filter === 'all') robots.setSelectedFilters(['all']);
            else {
                let updated = [...robots.selectedFilters, filter];
                if (robots.selectedFilters.includes('all')) {
                    updated = updated.filter(f => f !== 'all');
                }

                robots.setSelectedFilters(updated);
            }
        }
        else {
            if (filter === 'all' && robots.selectedFilters.length - 1 === filters.length) robots.setSelectedFilters([]);
            else {
                let updated = robots.selectedFilters.filter(f => f !== filter);
                if (updated.length === 0) updated.push('all');
                robots.setSelectedFilters(updated);
            }
        }
    };

    const getColorOfCategory = (robotCategory) => {
        const categoriesData = robots.categories;

        const foundData = categoriesData.find(category => category.id === robotCategory);
        if (foundData && foundData.color) return foundData.color;
        return '';
    };

    const toggleCommissionModal = () => {
        app.setShowCommissionModal(true);
    };

    useEffect(() => {
        // if (!robots.robotData || Object.keys(robots.robotData).length === 0) {
        robots.get(app.currentVersion);
        // }
        // eslint-disable-next-line
    }, [app.currentVersion]);

    useEffect(() => {
        if (!robots.premadePortfolios && !robots.premadePortfoliosLoaded) {
            robots.getPremadePortfolios();
        }
        // eslint-disable-next-line
    }, [robots.premadePortfolios, robots.premadePortfoliosLoaded]);

    useEffect(() => {
        if (robots.premadePortfolios && robots.premadePortfolios.length > 0) {
            let portfolios = [];
            if (app.currentVersion === 'pro') portfolios = robots.premadePortfolios.filter(p => p.tab === null || p.tab === "pro");
            else portfolios = robots.premadePortfolios.filter(p => p.tab === null || p.tab === "normal");

            setCurrentPortfolios(portfolios);
        }
        // eslint-disable-next-line
    }, [robots.premadePortfolios, app.currentVersion]);

    useEffect(() => {
        if (app.instrumentData) {
            const allFilters = [...app.instrumentData['regular'], ...app.instrumentData['micro']];
            setFilters(allFilters);
        }
    }, [app.instrumentData]);

    return (
        <div className="pb-[0.5rem]">
            {!robots.loaded && (
                <div className="flex items-center justify-center py-10">
                    <LoadingIcon className="w-8" />
                </div>
            )}
            {robots.loaded && (
                <div className="pb-4 relative">
                    <div className="relative z-10 flex my-[1rem]">
                        <div className={`flex ${showFilters ? 'bg-white text-[#040404] rounded-t-[0.5rem]' : 'bg-[#16131B] text-white rounded-[1.25rem]'} relative z-50 box-border border border-[rgba(255,255,255,0.2)] cursor-pointer select-none px-[1.25rem] py-[0.75rem] mr-[0.825rem] text-[0.8rem]`} onClick={toggleFilters}>
                            <div className="flex">
                                <span className="mr-[0.5rem]">
                                    Filter Bots
                                </span>
                                <ArrowDown className={`${showFilters ? "fill-black rotate-180" : "fill-current"} text-white w-4 h-full`} />
                            </div>
                            <ul
                                className={`bg-white text-theme-blue-900 text-[0.75rem] px-2 absolute left-[-1px] top-[2.7rem] w-[17.5rem] min-h-[3rem] max-h-[15rem] overflow-y-auto rounded-tr-[0.5rem] rounded-b-[0.5rem] ${showFilters ? "" : "hidden"}`}
                            >
                                <li key='all' className="flex items-center py-[0.6rem] px-[1rem]" onClick={(e) => handleFilterSelected(e, 'all')}>
                                    <div className={`w-[0.75rem] h-[0.75rem] box-border ${robots.selectedFilters.includes('all') ? 'bg-[#000AFF] border-[0.15rem] border-[#A5A9FE]' : 'bg-[#EBEBEB] border-[0.15rem] border-[#535353]'} rounded-[0.15rem] mr-[0.5rem]`}></div>
                                    Show All
                                </li>
                                {filters && filters.length > 0 && filters.map(filter => {
                                    if (!filter.signals || filter.signals < 1) return null;
                                    else return (
                                        <li key={filter.name} className="flex items-center py-[0.6rem] px-[1rem]" onClick={(e) => handleFilterSelected(e, filter.name)}>
                                            <div className={`w-[0.75rem] h-[0.75rem] box-border ${robots.selectedFilters.includes(filter.name) ? 'bg-[#000AFF] border-[0.15rem] border-[#A5A9FE]' : 'bg-[#EBEBEB] border-[0.15rem] border-[#535353]'} rounded-[0.15rem] mr-[0.5rem]`}></div>
                                            Show &nbsp;
                                            <span className="font-bold">{filter.name}</span>&nbsp;({filter.signals})
                                        </li>
                                    );
                                })}

                                {/* <li className="border-b border-[#E4E4E4] py-[0.6rem] px-[1rem]" onClick={() => setContract("es")}>
                                     E-Mini
                                 </li>
                                 <li className="py-[0.6rem] px-[1rem]" onClick={() => setContract("mes")}>
                                     Micro
                                 </li> */}
                            </ul>
                        </div>
                        <div className={`flex bg-[#16131B] text-white rounded-[1.25rem] relative z-50 box-border border border-[rgba(255,255,255,0.2)] select-none px-[1.25rem] py-[0.75rem] mr-[0.5rem] text-[0.8rem] cursor-pointer`} onClick={toggleBotPortfolio}>
                            <div className="flex">
                                <span className="mr-[0.5rem]">
                                    Your Bot Portfolio
                                </span>
                                <span className="flex justify-center items-center w-[1.2rem] h-[1.2rem] bg-[#FF555B] rounded-full mr-[0.5rem] text-[0.6rem]">
                                    {robots.selectedRobots.length || 0}
                                </span>
                                <ArrowDown className={`fill-current text-white w-4 h-full`} />
                            </div>
                        </div>
                    </div>
                    {currentPortfolios.length > 0 && robots.premadePortfoliosLoaded && (
                        <div>
                            <div className="pt-6 pb-4 flex items-center justify-between">
                                <h4 className={`text-[0.9rem] font-bold text-left`}>Plug & Trade Ready Portfolios</h4>
                            </div>
                            <PremadePortfolios premadePortfolios={currentPortfolios} />
                        </div>
                    )}
                    {!robots.premadePortfoliosLoaded && (
                        <Skeleton
                            count={9}
                            baseColor="rgba(255,255,255,0.1)"
                            highlightColor="#85c3ea"
                            duration={1.25}
                        />
                    )}

                    {robots?.categories.length > 0 && robots.categories.map(category => (
                        <div key={category.id}>
                            <div className="pt-6 pb-4 flex items-center justify-between">
                                <h4 className={`text-[0.9rem] font-bold text-left`} style={{ color: getColorOfCategory(category.id) }}>{category.name} Bots</h4>
                            </div>
                            <Robots
                                categoryId={category.id}
                                dotBg="bg-green-300"
                                robotList={robots.getRobotsFromCategory(category.id)}
                                categoryColor={getColorOfCategory(category.id)}
                            />
                        </div>
                    ))}
                    {robots?.categories.length < 1 && (
                        <Skeleton
                            count={9}
                            baseColor="rgba(255,255,255,0.1)"
                            highlightColor="#85c3ea"
                            duration={1.25}
                        />
                    )}

                    <div className="relative z-10 flex my-[1rem]">
                        <div className={`flex bg-[#16131B] text-white rounded-[1.25rem] relative z-50 box-border border border-[rgba(255,255,255,0.2)] select-none px-[1.25rem] py-[0.75rem] mr-[0.5rem] text-[0.8rem] cursor-pointer`} onClick={toggleCommissionModal}>
                            <div className="flex">
                                <span className="mr-[0.5rem]">
                                    Choose Your Commission Level
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}

export default CustomPortfolios;
