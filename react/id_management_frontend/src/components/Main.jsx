import React, {Component} from "react";
import MainAppBar from "./layout/MainAppBar";
import MainSideBar from "./layout/MainSideBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import {blue, green, grey} from "@material-ui/core/colors";
import {PORTALS} from "../actions";
import MainContent from "./layout/MainContent";
import MainRoutes from "./MainRoutes";
import {Redirect, Route} from "react-router-dom";
import {withRouter} from "react-router-dom";
import withPortal from "./hoc/withPortal";

const labels = {
    [PORTALS.IP]: "IP REPORTING",
    [PORTALS.CLUSTER]: "CLUSTER REPORTING"
};

class Main extends Component {
    getPortalsPath() {
        return `/:portal(${PORTALS.IP}|${PORTALS.CLUSTER})/`
    }

    render() {
        const {portal} = this.props;

        const theme = createMuiTheme({
            palette: {
                primary: {
                    main: portal === PORTALS.IP ? blue[500] : green[500],
                    contrastText: '#FFF'
                },
                common: {
                    whiteAlpha: 'rgba(255,255,255, 0.5)',
                    grey: grey[200]
                }
            }
        });

        return (
            <MuiThemeProvider theme={theme}>
                <div className="App">
                    <Route exact path="/" render={() => <Redirect to={`/${PORTALS.IP}`}/>}/>
                    <CssBaseline/>
                    <MainAppBar/>
                    <Route
                        path={this.getPortalsPath()}
                        render={props => (
                            <MainSideBar
                                {...props}
                                portalName={labels[portal]}
                            />
                        )}
                    />
                    <MainContent>
                        <Route
                            path={this.getPortalsPath()}
                            render={props => (
                                <MainRoutes {...props} portal={portal}/>
                            )}
                        />
                    </MainContent>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default withRouter(withPortal(Main));
