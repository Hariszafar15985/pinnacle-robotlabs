import { useContext } from "react";

import { formatFloatWithDollarSign } from "helpers/number";
import { AppContext } from "../../Provider";

function CommissionRow(props) {
    const { levelData, index } = props;

    const { app } = useContext(AppContext);

    const setLevel = (selectedLevel) => {
        app.setCommissionLevel(index, selectedLevel);
    }

    return (
        <div className={`grid grid-cols-12 gap-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F6F6F6]'} text-black text-[0.75rem] p-[0.5rem]`}>
            <div className="col-span-1">{levelData.name}</div>
            <div className="col-span-5">{levelData.long_name}</div>
            <div className="col-span-2 text-center flex justify-start items-center cursor-pointer" onClick={() => setLevel(1)}>
                <span className={`w-[0.9rem] h-[0.9rem] rounded-full border-[0.1rem] border-[#2F3238] mr-[0.5rem] ${levelData.selectedLevel === 1 ? 'bg-[#37BB8F]' : 'bg-white'}`}></span>
                <div>{formatFloatWithDollarSign(levelData['1'])}</div>
            </div>
            <div className="col-span-2 text-center flex justify-start items-center cursor-pointer" onClick={() => setLevel(2)}>
                <span className={`w-[0.9rem] h-[0.9rem] rounded-full border-[0.1rem] border-[#2F3238] mr-[0.5rem] ${levelData.selectedLevel === 2 ? 'bg-[#37BB8F]' : 'bg-white'}`}></span>
                <div>{formatFloatWithDollarSign(levelData['2'])}</div>
            </div>
            <div className="col-span-2 text-center flex justify-start items-center cursor-pointer" onClick={() => setLevel(3)}>
                <span className={`w-[0.9rem] h-[0.9rem] rounded-full border-[0.1rem] border-[#2F3238] mr-[0.5rem] ${levelData.selectedLevel === 3 ? 'bg-[#37BB8F]' : 'bg-white'}`}></span>
                <div>{formatFloatWithDollarSign(levelData['3'])}</div>
            </div>
        </div>
    );
}

export default CommissionRow;
