import { useContext, useEffect } from "react";
import { AppContext } from "../Provider";

function Price(props) {
    const { app, portfolios, addons, robots } = useContext(AppContext);

    useEffect(() => {
        app.setSubTotal();
        // eslint-disable-next-line
    }, [portfolios.selected, addons.selected, robots.selectedRobotSkus]);

    return (
        <div className={
            "h-28 fixed w-2/5 2xl:w-1/3 bottom-0 px-6 flex items-center " +
            (app.portfolioType === "preMade" ? "bg-theme-gray-800" : "bg-grey-bg")
        }
        >
            {/* <div>
        <div className="text-sm lg:text-base font-bold">{`Add ${
          app.portfolioType === "preMade" ? "Add-ons" : "more robots"
        } to get a bigger discount`}</div>
        <div className="flex bg-black rounded-l-full rounded-r-full py-0.5 cursor-pointer text-base lg:text-sm mt-1.5 mb-2">
          <div
            className={
              "w-1/2 text-center ml-1.5 my-0.5 py-0.5  " +
              (app.cartType !== "quarter"
                ? "bg-blue-600 rounded-l-full rounded-r-full font-bold"
                : "")
            }
            onClick={() => app.setCartType("year")}
          >
            Yearly
          </div>
          <div
            className={
              "w-1/2 text-center mr-1.5 my-0.5 py-0.5 " +
              (app.cartType === "quarter"
                ? "bg-blue-600 rounded-l-full rounded-r-full font-bold"
                : "")
            }
            onClick={() => app.setCartType("quarter")}
          >
            Quarterly
          </div>
        </div>
        <div className="text-lg lg:text-2xl">
          <b>
            Total:{" "}
            <span className="text-green-500">
              ${(app.subTotal - app.discount * app.subTotal).toFixed(2)}
            </span>
          </b>
        </div>
      </div> */}
        </div>
    );
}

export default Price;
