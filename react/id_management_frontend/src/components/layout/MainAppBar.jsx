import PropTypes from 'prop-types'
import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import mainStyles from "../../styles/mainStyles";
import AppSwitcher from "./AppSwitcher/AppSwitcher";
import Grid from "@material-ui/core/Grid";
import EtoolsLogo from "./EtoolsLogo";
import {Typography} from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";
import ProfileMenu from "./ProfileMenu/ProfileMenu";
import withProps from "../hoc/withProps";
import {user} from "../../helpers/props";

const styleSheet = {
    header: Object.assign({}, mainStyles.header, {
        zIndex: 10,
        left: mainStyles.sideBar.width,
        top: 0,
        position: "fixed",
        backgroundColor: "#233944",
        width: "calc(100% - " + mainStyles.sideBar.width + "px)"
    }),
    organization: {
        color: grey[400]
    },
    height: {
        height: "100%"
    }
};

class MainAppBar extends Component {
    render() {
        const {classes, user} = this.props;

        return (
            <Grid container justify="space-between" className={classes.header}>
                <Grid item>
                    <Grid
                        container
                        wrap="nowrap"
                        alignItems="center"
                        className={classes.height}
                    >
                        {user.hasIpAccess && user.hasClusterAccess &&
                        <Grid item component={AppSwitcher}/>}
                        <EtoolsLogo size={120} color="white"/>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid
                        container
                        wrap="nowrap"
                        alignItems="center"
                        className={classes.height}
                    >
                        <Typography
                            className={classes.organization}
                            variant="subheading"
                        >
                            {user.organization}
                        </Typography>
                        <ProfileMenu/>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

MainAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
    user: PropTypes.object
};

export default withProps(user)(withStyles(styleSheet, {name: "MainAppBar"})(MainAppBar));

