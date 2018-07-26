import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import mainStyles from "../../styles/mainStyles";
import AppSwitcher from "./AppSwitcher/AppSwitcher";
import Grid from "@material-ui/core/Grid";
import EtoolsLogo from "./EtoolsLogo";
import { Typography } from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";
import ProfileMenu from "./ProfileMenu/ProfileMenu";

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

const organization = "Save the children";

class MainAppBar extends Component {
    render() {
        const { classes } = this.props;

        return (
            <Grid container justify="space-between" className={classes.header}>
                <Grid item>
                    <Grid
                        container
                        wrap="nowrap"
                        alignItems="center"
                        className={classes.height}
                    >
                        <Grid item component={AppSwitcher} />
                        <EtoolsLogo size={120} color="white" />
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
                            {organization}
                        </Typography>
                        <ProfileMenu/>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styleSheet, { name: "MainAppBar" })(MainAppBar);
