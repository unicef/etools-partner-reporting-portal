import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from 'react';
import { Provider } from "react-redux";
import store from './store';
import Main from "./components/Main";
import { BrowserRouter as Router } from 'react-router-dom';
class App extends Component {
    render() {
        return (_jsx(Provider, { store: store, children: _jsx(Router, { basename: "/id-management", children: _jsx(Main, {}, void 0) }, void 0) }, void 0));
    }
}
export default App;
