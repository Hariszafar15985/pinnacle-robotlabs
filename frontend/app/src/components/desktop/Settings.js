import { useContext, useEffect, useState } from "react";

import { CHART_SUBTYPES, CHART_TYPES, INTERVAL_OPTIONS } from "constants/chart";
import { AppContext } from "../../Provider";
import { ReactComponent as ArrowDown } from "../../images/cheveron-down.svg";
// import { ReactComponent as ArrowDown } from "../../images/cheveron-down.svg";

function Settings(props) {
    const { app, portfolios, robots } = useContext(AppContext);

    const [monthInput, setMonthInput] = useState(12);
    const [showChartTypeSelect, setShowChartTypeSelect] = useState(false);
    const [showChartSubtypeSelect, setShowChartSubtypeSelect] = useState(false);
    const [showIntervalSelect, setShowIntervalSelect] = useState(false);

    const toggleChartTypeSelect = () => {
        setShowChartTypeSelect(prev => !prev);
    };

    const toggleChartSubtypeSelect = () => {
        setShowChartSubtypeSelect(prev => !prev);
    };

    const toggleIntervalSelect = () => {
        setShowIntervalSelect(prev => !prev);
    };

    const handleChartTypeSelected = (e, type) => {
        e.stopPropagation();
        app.setChartType(type);
        setShowChartTypeSelect(false);
    };

    const handleChartSubtypeSelected = (e, subtype) => {
        e.stopPropagation();
        app.setChartSubtype(subtype);
        setShowChartSubtypeSelect(false);
    };

    const handleIntervalSelected = (e, option) => {
        e.stopPropagation();
        app.setChartInterval(option);
        setShowIntervalSelect(false);
    };

    const onMonthInputChanged = (e) => {
        if (e.target.value) {
            app.setTriggerApiCall(true);
            setMonthInput(parseInt(e.target.value, 10));
        }
        else setMonthInput('');
    };

    const handleOnNumberOfMonthsInputBlur = () => {
        let input;
        if (!monthInput || monthInput === 0) input = 12;
        else if (monthInput > 120) input = 12;
        else input = monthInput;
        setMonthInput(input);
        app.setNumberOfMonths(input);
        app.setTriggerApiCall(true);
    };

    const onDecreaseMonths = () => {
        if (monthInput >= 2) {
            app.setNumberOfMonths(monthInput - 1);
            setMonthInput(prev => prev - 1);

            app.setTriggerApiCall(true);
        }
    };

    const onIncreaseMonths = () => {
        if (monthInput < 120) {
            app.setNumberOfMonths(monthInput + 1);
            setMonthInput(prev => prev + 1);

            app.setTriggerApiCall(true);
        }
    };

    const onCalculateResultsClicked = () => {
        app.reloadSimulationData();
    };

    const getTypeLabel = (chartType) => {
        const foundType = CHART_TYPES.find(type => type.value === chartType);
        return !foundType ? 'Chart Type' : foundType.name;
    };

    const getSubtypeLabel = (chartSubtype) => {
        const foundType = CHART_SUBTYPES.find(type => type.value === chartSubtype);
        return !foundType ? 'Subtype' : foundType.name;
    };

    const getIntervalLabel = (interval) => {
        const foundInterval = INTERVAL_OPTIONS.find(option => option.value === interval);
        return !foundInterval ? 'Interval' : foundInterval.name;
    };

    useEffect(() => {
        const reloadData = async () => {
            await app.reloadSimulationData();
        }

        if ((portfolios.selected || robots.selectedRobots) && !app.tour) {
            reloadData();
        }
        // eslint-disable-next-line
    }, [app.numberOfMonths]);

    return (
        <div className="flex text-xxs lg:text-[0.8rem] items-center justify-between contract">
            {/* <div className="flex bg-light-black relative z-50 rounded-[1.25rem] border border-[rgba(255,255,255,0.2)] cursor-pointer select-none px-[1.25rem] py-[0.75rem] mr-[0.5rem]">
                <div className="mr-[0.75rem]">Contract:</div>
                <div className="flex">
                    <span className="w-[1rem] h-[1rem] bg-[rgba(255,255,255,0.3)] rounded-full text-black text-[1.3rem] flex justify-center items-center cursor-pointer" onClick={onDecreaseContract}>-</span>
                    <div className="mx-[0.425rem] w-[2.3rem] border-b border-b-[rgba(255,255,255,0.3)]">
                        <input value={app.numberContract} onChange={e => setNumberOfContracts(e)} onBlur={handleOnNumberOfContractInputBlur} className=" w-full bg-transparent text-center" />
                    </div>
                    <span className="w-[1rem] h-[1rem] bg-[rgba(255,255,255,0.3)] rounded-full text-black text-[0.8rem] flex justify-center items-center cursor-pointer" onClick={onIncreaseContract}>+</span>
                </div>
            </div>
            <div className={`flex bg-light-black ${app.showContractType ? 'bg-white text-[#040404] rounded-t-[1.25rem]' : 'bg-light-black text-white rounded-[1.25rem]'} relative z-50 box-border border border-[rgba(255,255,255,0.2)] cursor-pointer select-none px-[1.25rem] py-[0.75rem] mr-[0.5rem]`} onClick={toggleSelectContractType}>
                <div className="flex w-[10rem]">
                    <span className="mr-auto">
                        {app.contract
                            ? app.contracts[app.contract]
                            : "Select Regular OR Micro"}
                    </span>
                    <ArrowDown className={`${app.showContractType ? "fill-black rotate-180" : "fill-current"} text-white w-4 h-full`} />
                </div>
                <ul
                    className={`bg-white text-theme-blue-900 px-2 pb-[0.5rem] absolute left-[-1px] top-[2.7rem] w-[12.6rem] rounded-b-[1.25rem] ${app.showContractType ? "" : "hidden"}`}
                >
                    <li className="border-b border-[#E4E4E4] py-[0.6rem] px-[1rem]" onClick={() => setContract("regular")}>
                        Regular
                    </li>
                    <li className="py-[0.6rem] px-[1rem]" onClick={() => setContract("micro")}>
                        Micro
                    </li>
                </ul>
            </div> */}
            <div className={`flex w-[12rem] ${showChartTypeSelect ? 'bg-white text-[#040404] rounded-t-[0.5rem]' : 'bg-light-black text-white rounded-[1.25rem]'} relative z-50 box-border border border-[rgba(255,255,255,0.2)] cursor-pointer select-none py-[0.75rem] mr-[0.5rem]`} onClick={toggleChartTypeSelect}>
                <div className="w-full flex justify-between px-[1rem]">
                    <span className={`${app.chartType === 'cumulative-drawdown' ? 'text-[0.7rem] leading-[1.2rem]' : 'text-[0.8rem]'}`}>
                        {app.chartType ? getTypeLabel(app.chartType) : 'Chart Type'}
                    </span>
                    <ArrowDown className={`${showChartTypeSelect ? "fill-black rotate-180" : "fill-current"} text-white w-4 h-full`} />
                </div>
                <ul className={`bg-white text-theme-blue-900 text-[0.75rem] pl-[1rem] pr-[0.5rem] absolute left-[-1px] top-[2.7rem] w-[12rem] min-h-[3rem] max-h-[15rem] overflow-y-auto rounded-b-[0.5rem] ${showChartTypeSelect ? "" : "hidden"}`}>
                    {CHART_TYPES && CHART_TYPES.length > 0 && CHART_TYPES.map(type => {
                        return (
                            <li key={type.name} className={`flex items-center py-[0.6rem] text-[0.6rem]`} onClick={(e) => handleChartTypeSelected(e, type.value)}>
                                <div className={`w-[0.75rem] h-[0.75rem] box-border ${app.chartType === type.value ? 'bg-[#000AFF] border-[0.15rem] border-[#A5A9FE]' : 'bg-[#EBEBEB] border-[0.15rem] border-[#535353]'} rounded-[0.15rem] mr-[0.5rem]`}></div>
                                <span className="font-bold">{type.name}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {(app.chartType === 'cumulative-net-profit' || app.chartType === 'cumulative-drawdown') && (
                <div className={`flex w-[8rem] ${showChartSubtypeSelect ? 'bg-white text-[#040404] rounded-t-[0.5rem]' : 'bg-light-black text-white rounded-[1.25rem]'} relative z-50 box-border border border-[rgba(255,255,255,0.2)] cursor-pointer select-none py-[0.75rem] mr-[0.5rem] text-[0.8rem]`} onClick={toggleChartSubtypeSelect}>
                    <div className="w-full flex justify-between px-[1rem]">
                        <span className="">
                            {app.chartSubtype ? getSubtypeLabel(app.chartSubtype) : 'Subtype'}
                        </span>
                        <ArrowDown className={`${showChartSubtypeSelect ? "fill-black rotate-180" : "fill-current"} text-white w-4 h-full`} />
                    </div>
                    <ul
                        className={`bg-white text-theme-blue-900 text-[0.75rem] pl-[1rem] pr-[0.5rem] absolute left-[-1px] top-[2.7rem] w-[8rem] min-h-[3rem] max-h-[15rem] overflow-y-auto rounded-b-[0.5rem] ${showChartSubtypeSelect ? "" : "hidden"}`}
                    >
                        {CHART_SUBTYPES && CHART_SUBTYPES.length > 0 && CHART_SUBTYPES.map(option => {
                            return (
                                <li key={option.name} className="flex items-center py-[0.6rem] text-[0.6rem]" onClick={(e) => handleChartSubtypeSelected(e, option.value)}>
                                    <div className={`w-[0.75rem] h-[0.75rem] box-border ${app.chartSubtype === option.value ? 'bg-[#000AFF] border-[0.15rem] border-[#A5A9FE]' : 'bg-[#EBEBEB] border-[0.15rem] border-[#535353]'} rounded-[0.15rem] mr-[0.5rem]`}></div>
                                    <span className="font-bold">{option.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            {(app.chartType === 'net-profit' || app.chartType === 'drawdown') && (
                <div className={`flex w-[8rem] ${showIntervalSelect ? 'bg-white text-[#040404] rounded-t-[0.5rem]' : 'bg-light-black text-white rounded-[1.25rem]'} relative z-50 box-border border border-[rgba(255,255,255,0.2)] cursor-pointer select-none py-[0.75rem] mr-[0.5rem] text-[0.8rem]`} onClick={toggleIntervalSelect}>
                    <div className="w-full flex justify-between px-[1rem]">
                        <span className="">
                            {app.chartInterval ? getIntervalLabel(app.chartInterval) : 'Interval'}
                        </span>
                        <ArrowDown className={`${showIntervalSelect ? "fill-black rotate-180" : "fill-current"} text-white w-4 h-full`} />
                    </div>
                    <ul
                        className={`bg-white text-theme-blue-900 text-[0.75rem] pl-[1rem] pr-[0.5rem] absolute left-[-1px] top-[2.7rem] w-[8rem] min-h-[3rem] max-h-[15rem] overflow-y-auto rounded-b-[0.5rem] ${showIntervalSelect ? "" : "hidden"}`}
                    >
                        {INTERVAL_OPTIONS && INTERVAL_OPTIONS.length > 0 && INTERVAL_OPTIONS.map(option => {
                            return (
                                <li key={option.name} className="flex items-center py-[0.6rem] text-[0.6rem]" onClick={(e) => handleIntervalSelected(e, option.value)}>
                                    <div className={`w-[0.75rem] h-[0.75rem] box-border ${app.chartInterval === option.value ? 'bg-[#000AFF] border-[0.15rem] border-[#A5A9FE]' : 'bg-[#EBEBEB] border-[0.15rem] border-[#535353]'} rounded-[0.15rem] mr-[0.5rem]`}></div>
                                    <span className="font-bold">{option.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            <div className="flex bg-light-black relative z-50 rounded-[1.25rem] border border-[rgba(255,255,255,0.2)] cursor-pointer select-none px-[1.25rem] py-[0.75rem] mr-[0.5rem]">
                <div className="mr-[0.75rem]">Backtest Performance (Months):</div>
                <div className="flex">
                    <span className="w-[1rem] h-[1rem] bg-[rgba(255,255,255,0.3)] rounded-full text-black text-[1.3rem] flex justify-center items-center cursor-pointer" onClick={onDecreaseMonths}>-</span>
                    <div className="mx-[0.425rem] w-[2.3rem] border-b border-b-[rgba(255,255,255,0.3)]">
                        <input value={monthInput} onChange={e => onMonthInputChanged(e)} onBlur={handleOnNumberOfMonthsInputBlur} className=" w-full bg-transparent text-center" />
                    </div>
                    <span className="w-[1rem] h-[1rem] bg-[rgba(255,255,255,0.3)] rounded-full text-black text-[0.8rem] flex justify-center items-center cursor-pointer" onClick={onIncreaseMonths}>+</span>
                </div>
            </div>
            <div className="flex bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] relative z-50 rounded-[1.25rem] cursor-pointer px-[1.25rem] py-[0.75rem]" onClick={onCalculateResultsClicked}>
                Calculate Results
            </div>
        </div>
    );
}

export default Settings;
