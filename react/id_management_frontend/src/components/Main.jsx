import PropTypes from 'prop-types'
import React, {Component} from "react";
import MainAppBar from "./layout/MainAppBar";
import MainSideBar from "./layout/MainSideBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import {blue, green, grey} from "@material-ui/core/colors";
import {PORTALS, switchPortal, error as errorAction} from "../actions";
import {fetch, FETCH_OPTIONS} from "../fetch";
import MainContent from "./layout/MainContent";
import MainRoutes from "./MainRoutes";
import {Redirect, Route} from "react-router-dom";
import {withRouter, matchPath} from "react-router-dom";
import {connect} from "react-redux";
import withProps from "./hoc/withProps";
import {portal, user} from "../helpers/props";
import Snackbar from "./common/Snackbar";

const labels = {
    [PORTALS.IP]: "IP REPORTING",
    [PORTALS.CLUSTER]: "CLUSTER REPORTING"
};

class Main extends Component {
    constructor(props) {
        super(props);

        this.onSnackbarClose = this.onSnackbarClose.bind(this);

        const {fetchData} = props;

        fetchData(FETCH_OPTIONS.USER_PROFILE);
        fetchData(FETCH_OPTIONS.WORKSPACES);
    }

    getPortalsPath() {
        return `/:portal(${PORTALS.IP}|${PORTALS.CLUSTER})/`
    }

    componentDidUpdate() {
        const {
            user,
            location,
            dispatchSwitchPortal,
            history,
            portal,
            fetchData
        } = this.props;

        if (!user.hasIpAccess && !user.hasClusterAccess) {
            window.location.href = "/";
            throw new Error("Unauthorized - Redirecting");
        }

        if ((!user.hasIpAccess && matchPath(location.pathname, `/${PORTALS.IP}`))) {
            dispatchSwitchPortal(PORTALS.CLUSTER, history);
        }

        if ((!user.hasClusterAccess && matchPath(location.pathname, `/${PORTALS.CLUSTER}`))) {
            dispatchSwitchPortal(PORTALS.IP, history);
        }

        if (portal === PORTALS.CLUSTER) {
            fetchData(FETCH_OPTIONS.CLUSTERS);
            fetchData(FETCH_OPTIONS.PARTNERS);
        }
    }

    onSnackbarClose() {
        const {dispatchError} = this.props;

        dispatchError(null);
    }

    render() {
        const {portal, error, initialized} = this.props;

        if (!initialized) {
            return null;
        }

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

        const redirect = portal || PORTALS.IP;

        return (
            <MuiThemeProvider theme={theme}>
                <div className="App">
                    <Route exact path="/" render={() => <Redirect to={`/${redirect}`}/>}/>
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
                                <MainRoutes {...props}/>
                            )}
                        />

                        <Snackbar open={!!error} variant="error" onClose={this.onSnackbarClose} message={error}/>
                    </MainContent>
                </div>
            </MuiThemeProvider>
        );
    }
}

Main.propTypes = {
    dispatchError: PropTypes.func.isRequired,
    dispatchSwitchPortal: PropTypes.func.isRequired,
    error: PropTypes.string,
    fetchData: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    initialized: PropTypes.bool,
    location: PropTypes.object.isRequired,
    portal: PropTypes.string,
    user: PropTypes.object
};

const mapStateToProps = (state) => {
    const {error, fetch: {pending}} = state;

    return {
        error,
        initialized: pending[FETCH_OPTIONS.USER_PROFILE] === false && pending[FETCH_OPTIONS.WORKSPACES] === false
    }
};

const mapDispatchToProps = dispatch => {
    return {
        dispatchSwitchPortal: (portal, history) => {
            dispatch(switchPortal(portal));
            history.push(`/${portal}`);
        },
        dispatchError: message => {
            dispatch(errorAction(message));
        },
        fetchData: option => dispatch(fetch(option))

    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withProps(user, portal)(Main)));

