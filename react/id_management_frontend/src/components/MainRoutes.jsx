import React, {Component, Fragment} from "react";
import {Redirect, Route, matchPath, withRouter} from "react-router-dom";
import Users from "./Users/Users";
import Partners from "./Partners/Partners";
import {PORTALS, switchPortal} from "../actions";
import {connect} from "react-redux";
import withPortal from "./hoc/withPortal";

class MainRoutes extends Component {
    constructor(props) {
        super(props);

        const {match: {params}, dispatchSwitchPortal} = props;

        dispatchSwitchPortal(params.portal);
    }

    render() {
        const {portal, match, location} = this.props;

        const routes = [
            {
                url: match.url + "/users",
                component: Users
            },
            {
                url: match.url + "/partners",
                component: Partners,
                hide: portal === PORTALS.IP
            }
        ];

        const availableRoutes = routes.map(
            (route, idx) =>
                route.hide ? (
                    matchPath(location.pathname, {path: route.url}) ? (
                        <Redirect key={idx} to={match.url}/>
                    ) : null
                ) : (
                    <Route
                        path={route.url}
                        component={route.component}
                        key={idx}
                    />
                )
        );

        return (
            <div>
                {!!portal &&
                <Fragment>
                    {matchPath(location.pathname, {
                        path: match.url,
                        exact: true
                    }) && <Redirect to={routes[0].url}/>}
                    {availableRoutes}
                </Fragment>}
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchSwitchPortal: portal => {
            dispatch(switchPortal(portal));
        }
    };
};

export default withRouter(connect(null, mapDispatchToProps)(withPortal(MainRoutes)));
