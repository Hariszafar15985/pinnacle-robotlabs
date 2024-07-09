import { useContext } from "react";
import { AppContext } from "../Provider";
import { ReactComponent as CloseIcon } from "../images/close.svg";

function Cart(props) {
    const { portfolios, addons, robots, app } = useContext(AppContext);

    let selectedPortfolio = null;
    let selectedAddons = [];
    let selectedRobots = [];

    // if (app.portfolioType === "preMade") {
    //     selectedPortfolio = portfolios.getBySku(portfolios.selected);
    //     for (let addonSku of addons.selected) {
    //         let addon = addons.getBySku(addonSku);
    //         selectedAddons.push(addon);
    //     }
    // } else {
    //     selectedRobots = robots.getBySkus(robots.selectedRobotSkus);
    // }

    // select again mean unselect
    const unSelectPortfolio = (sku) => {
        props.toggleCart();
        portfolios.select(sku);
    };

    const unSelectAddon = (sku) => {
        addons.select(sku);
    };

    const unSelectRobot = (sku) => {
        robots.select(sku);
    };

    const onGoBack = () => {
        props.toggleCart();
    };

    return (
        <div className="px-4 lg:px-6 h-full">
            <div className="flex py-6 lg:py-10">
                <button
                    className="bg-yellow-500 text-black px-3 lg:px-8
          py-0.5 rounded-l-full rounded-r-full mr-6 text-xs lg:text-sm
          lg:font-bold focus:outline-none"
                    onClick={() => onGoBack()}
                >
                    Go back to Portfolio
                </button>
            </div>
            <div className="w-full flex justify-center bg-theme-gray-800 rounded-l-full rounded-r-full px-0 py-0 cursor-pointer mb-10 bg-theme-gray-950 text-xs lg:text-sm">
                <div
                    className={
                        "w-1/2 text-center py-1 " +
                        (app.cartType !== "quarter"
                            ? "bg-blue-500 rounded-l-full rounded-r-full font-bold"
                            : "")
                    }
                    onClick={() => app.setCartType("year")}
                >
                    Yearly
                </div>
                <div
                    className={
                        "w-1/2 text-center py-1 " +
                        (app.cartType === "quarter"
                            ? "bg-blue-500 rounded-l-full rounded-r-full font-bold"
                            : "")
                    }
                    onClick={() => app.setCartType("quarter")}
                >
                    Quarterly
                </div>
            </div>
            <div className="bg-white rounded-xl mb-4 lg:mb-0">
                <div className="w-full rounded-t-xl bg-gray-200 text-black border-b-4 border-solid border-gray-400">
                    {app.portfolioType === "preMade" && selectedPortfolio && (
                        <div
                            className={`px-3 lg:px-4 py-4 grid grid-cols-10 gap-4 text-xs xs:text-sm ${selectedAddons.length > 1
                                ? "border-b-2 border-solid border-gray-300"
                                : ""
                                }`}
                        >
                            <div className="flex col-span-8 pr-6">
                                <div className="flex items-center mr-4">
                                    <CloseIcon
                                        className="w-5 fill-current text-black cursor-pointer"
                                        onClick={() => unSelectPortfolio(selectedPortfolio.sku)}
                                    />
                                </div>
                                <span>{selectedPortfolio.title}</span>
                            </div>
                            <div className="font-bold">
                                $
                                {app.cartType === "quarter"
                                    ? selectedPortfolio.quarter
                                    : selectedPortfolio.year}
                            </div>
                        </div>
                    )}

                    {app.portfolioType === "preMade" &&
                        selectedAddons.map((addon, index) => {
                            return (
                                <div
                                    key={addon.sku}
                                    className={`px-3 lg:px-4 py-4 grid grid-cols-10 gap-4 text-xs xs:text-sm ${index + 1 < selectedAddons.length
                                        ? "border-b-2 border-solid border-gray-300"
                                        : ""
                                        }`}
                                >
                                    <div className="flex col-span-8 pr-6">
                                        <div className="flex items-center mr-4">
                                            <CloseIcon
                                                className="w-5 fill-current text-black cursor-pointer"
                                                onClick={() => unSelectAddon(addon.sku)}
                                            />
                                        </div>
                                        <span>{addon.title}</span>
                                    </div>
                                    <div className="font-bold">
                                        ${app.cartType === "quarter" ? addon.quarter : addon.year}
                                    </div>
                                </div>
                            );
                        })}

                    {app.portfolioType !== "preMade" &&
                        selectedRobots.map((robot, index) => {
                            return (
                                <div
                                    key={robot.sku}
                                    className={`px-3 lg:px-4 py-4 grid grid-cols-10 gap-4 text-xs xs:text-sm ${index + 1 < selectedRobots.length
                                        ? "border-b-2 border-solid border-gray-300"
                                        : ""
                                        }`}
                                >
                                    <div className="flex items-center col-span-8 pr-6">
                                        <CloseIcon
                                            className="w-5 fill-current text-black mr-4 cursor-pointer"
                                            onClick={() => unSelectRobot(robot.sku)}
                                        />
                                        <span>{robot.title}</span>
                                    </div>
                                    <div className="font-bold">
                                        ${app.cartType === "quarter" ? robot.quarter : robot.year}
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <div className="text-green-500 text-base lg:text-lg pb-6">
                    <div className="pt-6 px-2 grid grid-cols-10 gap-4 font-bold">
                        <div className="col-span-8 text-right pr-6">Subtotal</div>
                        <div>${app.subTotal}</div>
                    </div>
                    <div className="pt-6 px-2 grid grid-cols-10 gap-4">
                        <div className="col-span-8 text-right pr-6">Discount</div>
                        <div>${(app.discount * app.subTotal).toFixed(2)}</div>
                    </div>
                    <div className="pt-6 px-2 grid grid-cols-10 gap-4 font-bold">
                        <div className="col-span-8 text-right pr-6">Total</div>
                        <div>
                            ${(app.subTotal - app.discount * app.subTotal).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="flex justify-center rounded-xl py-3 mt-10 text-center bg-green-400 text-white text-xl cursor-pointer"
                onClick={app.checkOut}
            >
                Checkout Now
            </div>
        </div>
    );
}

export default Cart;
