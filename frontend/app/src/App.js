import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import './App.css';
import Desktop from "./components/desktop/Desktop";
import useCheckMobileScreen from "./helpers/checkMobileScreen";
import Provider from "./Provider";

function App() {
    const isMobile = useCheckMobileScreen();

    useEffect(() => {
        let uid = localStorage.getItem("uid");
        if (!uid) {
            uid = uuidv4();
            localStorage.setItem("uid", uid);
        }
    }, []);

    return (
        <Provider>
            <div className="text-white">
                {!isMobile && <Desktop />}
                {isMobile && <div className="text-[20px] text-black">Please visit this site on Desktop</div>}
            </div>
        </Provider>
    );
}

export default App;
