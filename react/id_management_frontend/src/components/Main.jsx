import React, {Component} from "react";
import MainAppBar from "./layout/MainAppBar";
import MainSideBar from "./layout/MainSideBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import {blue, green, grey} from "@material-ui/core/colors";
import {PORTALS, userProfile, workspaces} from "../actions";
import MainContent from "./layout/MainContent";
import MainRoutes from "./MainRoutes";
import {Redirect, Route} from "react-router-dom";
import {withRouter} from "react-router-dom";
import withPortal from "./hoc/withPortal";
import {api} from "../infrastructure/api";
import {connect} from "react-redux";


const labels = {
    [PORTALS.IP]: "IP REPORTING",
    [PORTALS.CLUSTER]: "CLUSTER REPORTING"
};

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        let promises = [
            api.get("account/user-profile/")
                .then(res => {
                    props.dispatchUserProfile(res.data);
                }),
            api.get("core/workspace/")
                .then(res => {
                    props.dispatchWorkspaces(res.data);
                })
        ];

        Promise.all(promises)
            .finally(() => {this.setState({loading: false})});
    }

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
                {!this.state.loading &&
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
                </div>}
            </MuiThemeProvider>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchUserProfile: user => {
            dispatch(userProfile(user));
        },
        dispatchWorkspaces: data => {
            dispatch(workspaces(data))
        }
    };
};

export default withRouter(connect(null, mapDispatchToProps)(withPortal(Main)));
