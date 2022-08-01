import React, {Component} from "react";
import Apps from "@material-ui/icons/Apps";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import Grid from "@material-ui/core/Grid";
import {withStyles} from "@material-ui/core/styles";
import AppButton from "./AppButton";
import {grey} from "@material-ui/core/colors";
import {PORTALS, switchPortal} from "../../../actions";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import withMenu from "../../hoc/withMenu";
import {withRouter} from "react-router-dom";
import withProps from "../../hoc/withProps";
import {portal} from "../../../helpers/props";

const border = "1px solid #e0e0e0";

const labels = {
    [PORTALS.CLUSTER]: "CLUSTER PORTAL",
    [PORTALS.IP]: "UNICEF IP PORTAL"
};

const styleSheet = {
    appsHeader: {
        padding: "10px 20px",
        borderBottom: border,
        fontSize: 14
    },
    appSwitcher: {
        padding: 0
    },
    switchIcon: {
        borderRight: "1px solid rgba(255, 255, 255, 0.3)",
        color: grey[400],
        borderRadius: 0,
        height: "100%",
        width: 64
    },
    wrapper: {
        height: "100%",
    }
};

class AppSwitcher extends Component {
    appButtonClick = portal => {
        this.props.handleClose();
        this.props.onAppButtonClick(portal);
        this.props.history.push(`/${portal}`);
    };

    render() {
        const {classes, portal, anchorEl, handleClick, handleClose} = this.props;

        return (
            <div className={classes.wrapper}>
                <IconButton
                    className={classes.switchIcon}
                    onClick={handleClick}
                    aria-haspopup="true"
                    aria-owns={anchorEl ? "apps-menu" : null}
                >
                    <Apps/>
                </IconButton>
                <Menu
                    id="apps-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    MenuListProps={{className: classes.appSwitcher}}
                >
                    <div>
                        <div className={classes.appsHeader}>
                            Select an application
                        </div>
                        <Grid container>
                            <Grid item style={{borderRight: border}}>
                                <AppButton
                                    onClick={() =>
                                        this.appButtonClick(PORTALS.CLUSTER)
                                    }
                                    disabled={portal === PORTALS.CLUSTER}
                                    name={labels[PORTALS.CLUSTER]}
                                />
                            </Grid>
                            <Grid item>
                                <AppButton
                                    onClick={() =>
                                        this.appButtonClick(PORTALS.IP)
                                    }
                                    disabled={portal === PORTALS.IP}
                                    name={labels[PORTALS.IP]}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </Menu>
            </div>
        );
    }
}

AppSwitcher.propTypes = {
    anchorEl: PropTypes.any,
    classes: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    onAppButtonClick: PropTypes.func.isRequired,
    portal: PropTypes.string
};

const mapDispatchToProps = dispatch => {
    return {
        onAppButtonClick: portal => {
            dispatch(switchPortal(portal));
        }
    };
};

const ConnectedAppSwitcher = connect(
    null,
    mapDispatchToProps
)(withProps(portal)((withStyles(styleSheet)(withMenu(AppSwitcher)))));

export default withRouter(ConnectedAppSwitcher);
