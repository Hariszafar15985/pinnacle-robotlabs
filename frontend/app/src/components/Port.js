import React, { useContext } from "react";
import { AppContext } from "../Provider";
import { ReactComponent as SelectedIcon } from "../images/circle-selected.svg";
import { motion } from "framer-motion";

function Port(props) {
  const { portfolios } = useContext(AppContext);

  const selectVariant = {
    deactive: {},
    active: { backgroundColor: "#05c4a0", transition: { duration: 2 } },
  };

  const select = (sku) => {
    portfolios.select(sku);
  };
  return (
    <motion.div
      className={
        "flex border border-gray-500 select-none cursor-pointer py-3 px-6 " +
        "lg:pr-10 mt-5 lg:mt-3 rounded-3xl h-24 items-center bg-theme-gray-900"
      }
      key={props.portfolio.sku}
      animate={props.isActive ? "active" : "deactive"}
      variants={selectVariant}
      onClick={() => {
        select(props.portfolio.sku);
      }}
    >
      <div className="flex items-center">
        <div
          className={
            "rounded-full w-12 h-12 " +
            (props.isActive ? "bg-green-200" : "bg-theme-gray-700")
          }
        >
          {props.isActive ? <SelectedIcon className="w-full h-full p-1" /> : ""}
        </div>
      </div>
      <div className={"pl-5 flex-grow " + (props.isActive ? "text-black" : "")}>
        <h3 className="font-bold text-left pb-2 text-sm xs:text-base">
          {props.portfolio.title}
        </h3>
        <div
          className={
            "flex justify-between text-xxs xs:text-xs " +
            (props.isActive ? "" : "text-theme-gray-700")
          }
        >
          <div>{props.portfolio.number_robot} Bots</div>
          <div>· {props.portfolio.quarter}/Quarter</div>
          <div>· {props.portfolio.year}/Annual</div>
        </div>
      </div>
    </motion.div>
  );
}

export default Port;
