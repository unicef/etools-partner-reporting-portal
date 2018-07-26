import React, { Component } from "react";
import { Redirect, Route, matchPath } from "react-router-dom";
import Users from "./Users/Users";
import Partners from "./Partners/Partners";
import { PORTALS } from "../actions";

class MainRoutes extends Component {
    render() {
        const { portal, match, location } = this.props;

        const routes = [
            {
                url: match.path + "/users",
                component: Users
            },
            {
                url: match.path + "/partners",
                component: Partners,
                hide: portal === PORTALS.IP
            }
        ];

        const availableRoutes = routes.map(
            (route, idx) =>
                route.hide ? (
                    matchPath(location.pathname, { path: route.url }) ? (
                        <Redirect key={idx} to={match.url} />
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
                {matchPath(location.pathname, {
                    path: match.url,
                    exact: true
                }) && <Redirect to={routes[0].url} />}
                {availableRoutes}
            </div>
        );
    }
}

export default MainRoutes;
