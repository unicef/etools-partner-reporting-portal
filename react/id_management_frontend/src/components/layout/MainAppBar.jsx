import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import mainStyles from '../../styles/mainStyles';
import AppSwitcher from "./AppSwitcher/AppSwitcher";
import Grid from "@material-ui/core/Grid";
import EtoolsLogo from "./EtoolsLogo";

const styleSheet = {
    header: Object.assign({}, mainStyles.header, {
        zIndex: 10,
        left: mainStyles.sideBar.width,
        top: 0,
        position: 'fixed',
        backgroundColor: '#233944',
        width: 'calc(100% - ' + mainStyles.sideBar.width + 'px)',
    })
};

class MainAppBar extends Component {
    render() {
        const {classes} = this.props;

        return (
            <Grid container
                className={classes.header}
            >
                <Grid item component={AppSwitcher} />
                <EtoolsLogo size={120} color="white"/>
            </Grid>
        )
    }
}

export default withStyles(styleSheet, {name: "MainAppBar"})(MainAppBar);