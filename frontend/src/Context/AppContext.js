import React, {useState} from 'react';
import GuacozyApi from "../Api/GuacozyApi";

const api = new GuacozyApi();

const AppContext = React.createContext([{}, () => {
}]);

const AppProvider = (props) => {

    const checkLoginStatus = (retriesLeft) => {
        retriesLeft--;

        api.getCurrentUser()
            .then(r => {
                setState(oldState => ({...oldState, apiError: null, user: r.data}));
                updateConnections();
            })
            .catch(e => {
                    if (!e.response) {
                        setState(oldState => ({
                            ...oldState,
                            apiError: "No response. Retries left: " + retriesLeft,
                            user: null
                        }));
                        if (retriesLeft > 0) {
                            setTimeout(() => checkLoginStatus(retriesLeft), 2000);
                        }
                    } else {
                        setState(oldState => ({...oldState, apiError: null, user: null}));
                        window.location.href = "/accounts/login/";
                    }
                }
            )
    };

    const logout = () => {
        api.logout().then(() => {
                setState(defaultState);
                window.location.href = "/accounts/login/";
            }
        )
    };

    const updateConnections = () => {
        setState((state) => ({...state, connectionsLoading: true}));
        api.getConnections()
            .then(r => {
                    setState(state => ({...state, connections: r.data}))
                }
            )
            .finally(() => {
                setState((state) => ({...state, connectionsLoading: false}));
            })
    };
       
    const defaultState = {
        api: api,
        apiError: null,
        connections: [],
        connectionsLoading: false,
        user: null,
        actions: {
            checkLoginStatus: checkLoginStatus,
            logout: logout,
            updateConnections: updateConnections
        }
    };

    const [state, setState] = useState(defaultState);

    return (
        <AppContext.Provider value={[state, setState]}>
            {props.children}
        </AppContext.Provider>
    );
};

export {AppContext, AppProvider};