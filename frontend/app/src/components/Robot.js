import { useContext, useMemo } from "react";
import "swiper/swiper-bundle.min.css";

import { AppContext } from "../Provider";
import ActiveChart from "../images/active-bg-chart.svg";
import AggressiveChart from "../images/aggressive-bg-chart.svg";
import AmbitiousChart from "../images/ambitious-bg-chart.svg";
import { ReactComponent as CheckIcon } from "../images/checkmark.svg";
// import { ReactComponent as ArrowDown } from "../images/cheveron-down.svg";
import RobotIcons from "./RobotIcons";

function Robot(props) {
    const { robot, categoryColor, categoryId } = props;
    const { app, robots } = useContext(AppContext);

    const isRobotIdSelected = useMemo(() => {
        for (let selectedRobot of robots.selectedRobots) {
            if (selectedRobot.id === robot.id) return true;
        }
        return false;
    }, [robot.id, robots.selectedRobots]);

    const checkIfIntrumentIsSelected = (instrumentName) => {
        for (let selectedRobot of robots.selectedRobots) {
            if (selectedRobot.id === robot.id && selectedRobot.selectedInstrument.includes(instrumentName)) return true;
        }

        return false;
    }

    const onRobotInsComboSelect = (robot, instrumentName) => {
        robots.select(robot, instrumentName);
        app.setTriggerApiCall(true);
    };

    const getIcon = (robotTitle, robotGroup) => {
        let icon;
        if (["Power Signals", "Maker Signals", "International Signals", "Liquidity Signals", "Scalping Signals"].includes(robotGroup)) {
            icon = RobotIcons[robotGroup] != null ? RobotIcons[robotGroup] : RobotIcons["fallback"];
        }
        else {
            let key = robotTitle.toLowerCase();
            icon =
                typeof RobotIcons[key] !== "undefined"
                    ? RobotIcons[key]
                    : RobotIcons["fallback"];
        }
        return icon();
    };

    const getChartImg = () => {
        switch (categoryId) {
            case 1:
                return ActiveChart;
            case 2:
                return AmbitiousChart;
            case 3:
                return AggressiveChart;
            default:
                return ActiveChart;
        }
    };

    const onNumberOfContractChange = (e, robot, instrumentName) => {
        let value = '';
        if (e.target.value) {
            value = parseInt(e.target.value, 10);
        }
        robots.setNumberOfContractForRobot(robot, instrumentName, value);
        app.setTriggerApiCall(true);
    };

    const handleOnNumberOfContractInputBlur = (robot, instrumentName) => {
        if (isNaN(robot.instrumentData[instrumentName]) || robot.instrumentData[instrumentName] === '') {
            robots.setNumberOfContractForRobot(robot, instrumentName, 0);
            app.setTriggerApiCall(true);
        }
    };

    const onDecreaseNumberOfContract = (e, robot, instrumentName) => {
        e.stopPropagation();
        if (robot.instrumentData[instrumentName] >= 1) {
            const value = robot.instrumentData[instrumentName] - 1;
            robots.setNumberOfContractForRobot(robot, instrumentName, value);
            app.setTriggerApiCall(true);
        }
    };

    const onIncreaseMonths = (e, robot, instrumentName) => {
        e.stopPropagation();
        const value = robot.instrumentData[instrumentName] + 1;
        robots.setNumberOfContractForRobot(robot, instrumentName, value);
        app.setTriggerApiCall(true);
    };

    return (
        <>
            <div
                // onClick={() => select(robot)}
                className={"relative overflow-hidden h-[6rem] rounded-t-[1rem] py-[0.5rem] select-none box-border " + (isRobotIdSelected ? "bg-[#263850] border-t border-l border-r" : "bg-[#16131B]")}
                style={{ borderColor: isRobotIdSelected ? categoryColor : '' }}
            >
                <div className="flex flex-col px-[0.5rem] pb-[0.5rem]">
                    {/* <div className="flex justify-between items-center">
                        <div className={`w-[1.2rem] h-[1.2rem] p-1 rounded-full ${selected ? "" : "bg-gray-500"}`} style={{ backgroundColor: selected ? categoryColor : '' }}>
                            <CheckIcon />
                        </div>
                    </div> */}
                    <div className="flex flex-col justify-center items-center relative z-10 mt-[0.5rem] mb-[0.5rem]">
                        {getIcon(robot.name, robot.group)}
                        <span className="max-h-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis mt-[0.4rem] font-bold text-center text-[0.6rem] text-white">
                            {robot.name}
                        </span>
                    </div>
                    {/* <div className="w-full flex flex-col items-center z-10">
                        <div className="flex mb-[0.45rem]">
                            <span className="w-[0.9rem] h-[0.9rem] bg-[rgba(255,255,255,0.3)] rounded-full text-black text-[1.2rem] flex justify-center items-center cursor-pointer" onClick={e => onDecreaseNumberOfContract(e, robot)}>-</span>
                            <div className="mx-[0.425rem] w-[0.9rem] border-b border-b-[rgba(255,255,255,0.3)] text-[0.6rem] font-bold">
                                <input value={robot.number_of_contract} onChange={e => onNumberOfContractChange(e, robot)} onBlur={handleOnNumberOfContractInputBlur(robot)} onClick={e => e.stopPropagation()} className=" w-full bg-transparent text-center" />
                            </div>
                            <span className="w-[0.9rem] h-[0.9rem] bg-[rgba(255,255,255,0.3)] rounded-full text-black text-[0.7rem] flex justify-center items-center cursor-pointer" onClick={e => onIncreaseMonths(e, robot)}>+</span>
                        </div>
                        <div className={`flex flex-col w-[3.5rem] rounded-[0.5rem] ${showMarketSelection ? 'bg-white text-[#040404]' : 'bg-[rgba(255,255,255,0.2)] text-white'} relative z-10 cursor-pointer select-none px-[0.4rem] py-[0.275rem] text-[0.6rem]`} onClick={e => toggleMarketSelection(e)}>
                            <div className="w-full flex justify-between">
                                <span className="font-bold">
                                    {robot.instrument}
                                </span>
                                <ArrowDown className={`${showMarketSelection ? "fill-black rotate-180" : "text-white fill-current"} w-[0.75rem] h-full`} />
                            </div>
                            <ul
                                className={`w-full min-h-[2rem] max-h-[5rem] bg-white z-50 text-theme-blue-900 relative left-[-1px] top-[0rem] mt-[0.25rem] overflow-y-auto ${showMarketSelection ? "" : "hidden"}`}
                            >
                                {robot.instruments && robot.instruments.length > 0 && robot.instruments.map(ins => {
                                    return (
                                        <li key={ins} className="flex items-center py-[0.25rem]" onClick={(e) => handleFilterSelected(e, robot, ins)}>
                                            <span className="font-bold">{ins}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div> */}

                </div>
                <img
                    src={getChartImg()}
                    alt=""
                    className={`absolute max-w-none w-full top-[40%] opacity-80`}
                />
            </div>
            <div
                className={`w-full h-[4rem] flex justify-between bg-[#16131B] overflow-hidden rounded-b-[1rem] box-border ${isRobotIdSelected ? 'border-b border-l border-r' : 'border-none'}`}
                style={{ borderColor: isRobotIdSelected ? categoryColor : '' }}
            >
                {robot.instruments?.length > 0 && robot.instruments.map((ins, index) => {
                    if (index < 2) return (
                        <div key={ins.name}
                            className={`text-white text-[0.5rem] font-bold w-full flex flex-col items-center justify-between cursor-pointer p-[0.5rem] pb-[0.6rem] ${checkIfIntrumentIsSelected(ins.name) ? (index === 0 ? (robot.instruments.length < 2 ? 'border-t bg-[#263850]' : 'border-t border-r bg-[#263850]') : 'border-t border-l bg-[#263850]') : 'border-none'} hover:bg-[rgba(255,255,255,0.1)]`}
                            style={{ borderColor: checkIfIntrumentIsSelected(ins.name) ? categoryColor : '' }}
                            onClick={() => onRobotInsComboSelect(robot, ins.name)}
                        >
                            <div className="flex justify-center items-center w-full">
                                <div className={`w-[1.2rem] h-[1.2rem] mr-[0.5rem] p-1 rounded-full ${checkIfIntrumentIsSelected(ins.name) ? "" : "bg-[rgba(255,255,255,0.2)]"}`} style={{ backgroundColor: checkIfIntrumentIsSelected(ins.name) ? categoryColor : '' }}>
                                    <CheckIcon />
                                </div>
                                <div className="flex flex-col uppercase">
                                    <span>{ins.type}</span>
                                    <span className="text-[rgba(255,255,255,0.5)]">{ins.name}</span>
                                </div>
                            </div>
                            <div className="flex mb-[0rem]">
                                <span className="w-[0.9rem] h-[0.9rem] bg-[rgba(255,255,255,0.2)] rounded-full text-black text-[1.2rem] flex justify-center items-center cursor-pointer" onClick={e => onDecreaseNumberOfContract(e, robot, ins.name)}>-</span>
                                <div className="mx-[0.425rem] w-[0.9rem] border-b border-b-[rgba(255,255,255,0.3)] text-[0.6rem] font-bold">
                                    <input value={robot.instrumentData[ins.name]} onChange={e => onNumberOfContractChange(e, robot, ins.name)} onBlur={handleOnNumberOfContractInputBlur(robot, ins.name)} onClick={e => e.stopPropagation()} className=" w-full bg-transparent text-center" />
                                </div>
                                <span className="w-[0.9rem] h-[0.9rem] bg-[rgba(255,255,255,0.2)] rounded-full text-black text-[0.7rem] flex justify-center items-center cursor-pointer" onClick={e => onIncreaseMonths(e, robot, ins.name)}>+</span>
                            </div>
                        </div>
                    )
                    return null;
                })}
            </div>
            <div className={`pt-2 px-1 font-semibold text-center text-[0.55rem] uppercase text-[${categoryColor}]`}>{robot.markets_long}</div>
        </>
    );
}

export default Robot;
