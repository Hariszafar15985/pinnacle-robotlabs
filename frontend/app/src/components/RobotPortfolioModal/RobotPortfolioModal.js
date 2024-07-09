import { useContext } from "react";
import "swiper/swiper-bundle.min.css";

import { AppContext } from "../../Provider";
import { ReactComponent as CloseIcon } from "../../images/tour/close.svg";
import RobotInfoRow from "./RobotInfoRow";

function RobotPortfolioModal(props) {
    const { app, robots } = useContext(AppContext);

    const onClose = () => {
        app.setShowRobotPortfolioModal(false);
    };

    const getColorOfCategory = (robotCategory) => {
        const categoriesData = robots.categories;

        const foundData = categoriesData.find(category => category.id === robotCategory);
        if (foundData && foundData.color) return foundData.color;
        return '';
    };

    const renderContent = () => {
        return (
            <>
                {robots?.categories.length > 0 && robots.categories.map(category => (
                    <div key={category.id} className="w-full mb-[0.5rem]">
                        <div className="">
                            <h4 className={`text-[0.9rem] font-bold text-left`} style={{ color: getColorOfCategory(category.id) }}>{category.name} Bots</h4>
                        </div>
                        <div className="flex flex-wrap w-full">
                            {robots.selectedRobots && robots.selectedRobots.length > 0 && robots.selectedRobots.filter(robot => robot.category === category.id)?.map((robot, index) => {
                                if (robot.instruments && robot.instruments?.length === 1) return (<RobotInfoRow key={robot.sku} index={index} robot={robot} instrument={robot.instruments[0]} mainColor={getColorOfCategory(category.id)} />);
                                if (robot.instruments && robot.instruments?.length === 2) {
                                    return (robot.instruments.map(instrument => {
                                        if (robot.selectedInstrument.includes(instrument.name)) return (<RobotInfoRow key={`${robot.sku}-${instrument.name}`} index={index} robot={robot} instrument={instrument} mainColor={getColorOfCategory(category.id)} />);
                                        return null;
                                    }));
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
            </>
        )
    }

    return (
        <div
            className="h-screen animated fadeIn faster fixed left-0 top-0 flex overflow-auto justify-center items-center inset-0 z-30 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"
            id="signal-info-modal"
            onClick={onClose}
        >
            <div className={`fixed z-40 sm:w-full md:w-2/3 h-3/4 rounded-lg shadow-lg`} onClick={e => e.stopPropagation()}>
                <CloseIcon
                    className="w-[1.5rem] h-[1.5rem] absolute z-50 -top-[0.7rem] -right-[0.7rem] cursor-pointer"
                    onClick={onClose}
                />
                <div className={`fixed overflow-auto z-30 sm:w-full md:w-2/3 h-3/4 rounded-[1rem] shadow-lg bg-[white] items-center justify-center`}>
                    <div className="w-full px-[1.5rem] py-[2rem]">
                        <div className="w-full flex justify-start mb-[1rem] text-[1.6rem] font-bold text-black">
                            Your Bot Portfolio
                        </div>
                        <div className="w-full">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RobotPortfolioModal;
