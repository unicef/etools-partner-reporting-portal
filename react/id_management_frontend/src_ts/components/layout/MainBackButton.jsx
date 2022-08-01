import PropTypes from 'prop-types'
import React, {Component} from 'react';
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Grid from "@material-ui/core/Grid";
import {withStyles} from "@material-ui/core/styles";
import grey from "@material-ui/core/colors/grey";
import withProps from "../hoc/withProps";
import {portal} from "../../helpers/props";

const label = "User Management";

const styleSheet = (theme) => ({
    mainBackButton: {
        textAlign: 'left',
        borderRadius: '0',
        boxShadow: 'none',
        textTransform: 'none',
        width: '100%',
        fontSize: '20px',
        fontWeight: 400,
        color: grey[100]
    },
    backArrow: {
        color: theme.palette.primary[200]
    }
});

class MainBackButton extends Component {
    goBack() {
        const {portal} = this.props;

        document.location.href = "/app/" + portal;
    }

    render() {
        const {classes} = this.props;

        return (
            <Button onClick={() => this.goBack()} variant="contained" color="primary"
                    className={classes.mainBackButton}>
                <Grid container spacing={24} alignItems="center" wrap="nowrap">
                    <Grid item><ArrowBack className={classes.backArrow}/></Grid>
                    <Grid item>{label}</Grid>
                </Grid>
            </Button>
        )
    }
}

MainBackButton.propTypes = {
    classes: PropTypes.object.isRequired,
    portal: PropTypes.string
};

export default withProps(portal)(withStyles(styleSheet)(MainBackButton));

