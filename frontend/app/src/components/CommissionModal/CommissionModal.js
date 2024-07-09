import { useContext } from "react";
import "swiper/swiper-bundle.min.css";

import { AppContext } from "../../Provider";
import { ReactComponent as CloseIcon } from "../../images/tour/close.svg";
import CommissionRow from "./CommissionRow";

function CommissionModal(props) {
    const { app } = useContext(AppContext);

    const onClose = () => {
        app.setShowCommissionModal(false);
    };

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
                    <div className="w-full px-[2rem] py-[2rem]">
                        <div className="w-full flex justify-start mb-[1rem] text-[1.6rem] font-bold text-black">
                            Commission Level
                        </div>
                        <div className="w-full flex-col">
                            <div className="grid grid-cols-12 gap-0 bg-[#2F3238] text-[0.7rem] font-bold p-[0.5rem]">
                                <div className="col-span-1">Code</div>
                                <div className="col-span-5">Instrument</div>
                                <div className="col-span-2">Commission Low</div>
                                <div className="col-span-2">Commission Medium</div>
                                <div className="col-span-2">Commission High</div>
                            </div>
                            {app.commissionData?.length > 0 && app.commissionData?.map((level, index) => (
                                <CommissionRow key={index} levelData={level} index={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommissionModal;
