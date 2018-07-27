import React, {Component} from 'react';
import {Provider} from "react-redux";
import store from './store';
import Main from "./components/Main";
import {BrowserRouter as Router} from 'react-router-dom';

class App extends Component {
    render() {
        return ( 
            <Provider store={store}>
                <Router basename="/id-management">
                    <Main/>
                </Router>
            </Provider>
        );
    }
}

export default App;
