import PropTypes from 'prop-types'
import React, {Component, Fragment} from "react";
import {Redirect, Route, matchPath, withRouter} from "react-router-dom";
import Users from "./Users/Users";
import Partners from "./Partners/Partners";
import {PORTALS, switchPortal} from "../actions";
import {connect} from "react-redux";
import withProps from "./hoc/withProps";
import {portal, user} from "../helpers/props";
import {hasPartnersAccess} from "../helpers/user";

class MainRoutes extends Component {
    constructor(props) {
        super(props);

        const {match: {params}, dispatchSwitchPortal} = props;

        dispatchSwitchPortal(params.portal);
    }

    buildUrl(path) {
        const {match: {url}} = this.props;

        let result = url;

        if (!url.endsWith("/")) {
            result += "/";
        }

        return result + path;
    }

    render() {
        const {portal, match, location, user} = this.props;

        const routes = [
            {
                url: this.buildUrl("users"),
                component: Users
            },
            {
                url: this.buildUrl("partners"),
                component: Partners,
                hide: portal === PORTALS.IP || !hasPartnersAccess(user)
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

MainRoutes.propTypes = {
    dispatchSwitchPortal: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    portal: PropTypes.string,
    user: PropTypes.object.isRequired
};

const mapDispatchToProps = dispatch => {
    return {
        dispatchSwitchPortal: portal => {
            dispatch(switchPortal(portal));
        }
    };
};

export default withRouter(connect(null, mapDispatchToProps)(withProps(portal, user)(MainRoutes)));

