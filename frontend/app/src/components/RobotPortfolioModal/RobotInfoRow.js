import { useContext } from "react";
import "swiper/swiper-bundle.min.css";

import { AppContext } from "../../Provider";
import { ReactComponent as CheckIcon } from "../../images/checkmark.svg";

function RobotInfoRow(props) {
    const { robot, instrument, mainColor } = props;
    const { robots } = useContext(AppContext);

    const onNumberOfContractChange = (e, robot, instrumentName) => {
        let value = '';
        if (e.target.value) {
            value = parseInt(e.target.value, 10);
        }
        robots.setNumberOfContractForRobot(robot, instrumentName, value);
    };

    const handleOnNumberOfContractInputBlur = (robot, instrumentName) => {
        if (isNaN(robot.instrumentData[instrumentName]) || robot.instrumentData[instrumentName] === '') robots.setNumberOfContractForRobot(robot, instrumentName, 0)
    };

    const onDecreaseNumberOfContract = (e, robot, instrumentName) => {
        e.stopPropagation();
        if (robot.instrumentData[instrumentName] >= 1) {
            const value = robot.instrumentData[instrumentName] - 1;
            robots.setNumberOfContractForRobot(robot, instrumentName, value);
        }
    };

    const onIncreaseMonths = (e, robot, instrumentName) => {
        e.stopPropagation();
        const value = robot.instrumentData[instrumentName] + 1;
        robots.setNumberOfContractForRobot(robot, instrumentName, value);
    };

    const handleUnselectRobot = (e, robot, instrumentName) => {
        e.stopPropagation();
        robots.select(robot, instrumentName);
    };

    return (
        <div key={`${robot.sku}-${instrument.name}`} className={`w-1/2 relative z-10 overflow-visible flex items-center justify-between mt-[1rem] mb-[2rem] px-[0.75rem]`}>
            <div className="flex items-center">
                <div className={`w-[1.2rem] h-[1.2rem] p-1 rounded-full mr-[0.5rem]`} style={{ backgroundColor: mainColor }}>
                    <CheckIcon fill="white" />
                </div>
                <span className="text-black text-[0.8rem] w-[11.05rem]">{robot.name}</span>
                {/* <div className={`flex flex-col w-[3.5rem] ${showMarketSelection ? "rounded-t-[0.5rem]" : "rounded-[0.5rem]"} bg-[#E8E8E9] relative z-10 cursor-pointer select-none px-[0.4rem] py-[0.2rem] text-[0.6rem] text-[#16131B] mr-[1rem]`} onClick={e => toggleMarketSelection(e)}>
                    <div className="w-full flex justify-between">
                        <span className="font-bold">
                            {robot.instrument}
                        </span>
                        <ArrowDown className={`${showMarketSelection ? "rotate-180" : ""} fill-black w-[0.75rem] h-full`} />
                    </div>
                    <ul
                        className={`w-full min-h-[1.5rem] max-h-[2.8rem] bg-[#E8E8E9] z-50 absolute left-[0px] top-[1rem] mt-[0.25rem] rounded-b-[0.5rem] px-[0.4rem] overflow-y-auto ${showMarketSelection ? "" : "hidden"}`}
                    >
                        {robot.instruments && robot.instruments.length > 0 && robot.instruments.map(ins => {
                            return (
                                <li key={ins} className="flex items-center py-[0.2rem]" onClick={(e) => handleFilterSelected(e, robot, ins)}>
                                    <span className="font-bold">{ins}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div> */}
                <div className={`flex flex-col w-[3.5rem] px-[0.4rem] py-[0.2rem] text-[0.6rem] text-[#16131B] font-bold mr-[1rem]`}>
                    {instrument.name}
                </div>
                <div className="flex text-black mr-[1rem]">
                    <span className="w-[0.9rem] h-[0.9rem] bg-[#E8E8E9] rounded-full text-[1.2rem] flex justify-center items-center cursor-pointer" onClick={e => onDecreaseNumberOfContract(e, robot, instrument.name)}>-</span>
                    <div className="mx-[0.425rem] w-[0.9rem] border-b border-b-[#16131B] text-[0.6rem] font-bold">
                        <input value={robot.instrumentData[instrument.name]} onChange={e => onNumberOfContractChange(e, robot, instrument.name)} onBlur={handleOnNumberOfContractInputBlur(robot, instrument.name)} onClick={e => e.stopPropagation()} className=" w-full bg-transparent text-center" />
                    </div>
                    <span className="w-[0.9rem] h-[0.9rem] bg-[#E8E8E9] rounded-full text-[0.7rem] flex justify-center items-center cursor-pointer" onClick={e => onIncreaseMonths(e, robot, instrument.name)}>+</span>
                </div>
                <div className="text-white flex items-center justify-center min-w-[1rem] w-[1rem] h-[1rem] bg-black rounded-full text-[1.2rem] cursor-pointer" onClick={e => handleUnselectRobot(e, robot, instrument.name)}>-</div>
            </div>
        </div>
    );
}

export default RobotInfoRow;
