import React, {Component} from 'react';
import MainAppBar from "./layout/MainAppBar";
import MainSideBar from "./layout/MainSideBar";
import CssBaseline from '@material-ui/core/CssBaseline';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {blue, green} from '@material-ui/core/colors';
import {connect} from 'react-redux';
import {PORTALS} from "../actions";
import MainContent from "./layout/MainContent";
import MainRoutes from "./MainRoutes";
import {Route} from 'react-router-dom';
import {withRouter} from 'react-router-dom';


const labels = {
    IP: "IP REPORTING",
    CLUSTER: "CLUSTER REPORTING"
};

class Main extends Component {
    render() {
        const {portal} = this.props;

        const theme = createMuiTheme({
            palette: {
                primary: portal === PORTALS.IP ? blue : green,
            },
        });

        return (
            <MuiThemeProvider theme={theme}>
                <div className="App">
                    <CssBaseline/>
                    <MainAppBar/>
                    <Route path="/id-management" render={(props) => <MainSideBar {...props} portalName={labels[portal]}/>}/>
                    <MainContent>
                        <Route path="/id-management" render={(props) => <MainRoutes {...props} portal={portal}/>}/>
                    </MainContent>
                </div>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = state => {
    return {
        portal: state.portal
    }
};

export default withRouter(connect(mapStateToProps)(Main));
