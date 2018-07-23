import React, { Component } from "react";
import Apps from "@material-ui/icons/Apps";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import AppButton from "./AppButton";
import { grey } from "@material-ui/core/colors";
import { PORTALS, switchPortal } from "../../../actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import withMenu from "../../hoc/withMenu";

const border = "1px solid #e0e0e0";

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
        marginRight: ".75em"
    }
};

class AppSwitcher extends Component {
    appButtonClick = portal => {
        this.props.handleClose();
        this.props.onAppButtonClick(portal);
    };

    render() {
        const { classes, portal, anchorEl, handleClick, handleClose } = this.props;

        return (
            <div className={classes.wrapper}>
                <IconButton
                    className={classes.switchIcon}
                    onClick={handleClick}
                    aria-haspopup="true"
                    aria-owns={anchorEl ? "apps-menu" : null}
                >
                    <Apps />
                </IconButton>
                <Menu
                    id="apps-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    MenuListProps={{ className: classes.appSwitcher }}
                >
                    <div>
                        <div className={classes.appsHeader}>
                            Select an application
                        </div>
                        <Grid container>
                            <Grid item style={{ borderRight: border }}>
                                <AppButton
                                    onClick={() =>
                                        this.appButtonClick(PORTALS.CLUSTER)
                                    }
                                    disabled={portal === PORTALS.CLUSTER}
                                    name="Cluster Portal"
                                />
                            </Grid>
                            <Grid item>
                                <AppButton
                                    onClick={() =>
                                        this.appButtonClick(PORTALS.IP)
                                    }
                                    disabled={portal === PORTALS.IP}
                                    name="IP Portal"
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
    portal: PropTypes.string.isRequired,
    onAppButtonClick: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        portal: state.portal
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAppButtonClick: portal => {
            dispatch(switchPortal(portal));
        }
    };
};

const ConnectedAppSwitcher = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styleSheet)(withMenu(AppSwitcher)));

export default ConnectedAppSwitcher;
