
import popupBot from "../images/popup_bot.gif";

export default function MessageModal(props) {
    const { message } = props;
    return (
        <div className="min-w-screen h-screen animated fadeIn fixed left-0 top-0 flex overflow-auto justify-center items-center inset-0 z-100 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"
            id="robot-portfolio-modal"
        >
            <div className="fixed z-40 sm:w-3/4 md:w-1/5 h-20 rounded-xl shadow-xl">
                <div className="font-bold flex items-center px-2 2xl:px-4 fixed overflow-auto z-30 sm:w-3/4 md:w-1/5 h-20 rounded-xl shadow-xl bg-theme-gray-800">
                    <div className="w-1/4 flex justify-center mr-[0.5rem]">
                        <img className="w-[2.5rem] h-[2.5rem]" src={popupBot} alt="popup_robot" />
                    </div>
                    <div className="w-3/4 flex justify-center text-sm 3xl:text-base">{message === true ? 'Please wait while we calculate your custom portfolio' : message}</div>
                </div>
            </div>
        </div>
    );
}
