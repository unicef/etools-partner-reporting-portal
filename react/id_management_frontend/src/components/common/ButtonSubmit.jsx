import React, {Component} from "react";
import {Button, CircularProgress} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import labels from "../../labels";
import PropTypes from "prop-types";

const styleSheet = theme => ({
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    buttonProgress: {
        color: theme.palette.secondary.main,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

class ButtonSubmit extends Component {
    render() {
        const {classes, label, loading} = this.props;
        const buttonLabel = label || labels.save;

        return (
            <div className={classes.wrapper}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>{buttonLabel}</Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
            </div>
        );
    }
}

ButtonSubmit.propTypes = {
    classes: PropTypes.object.isRequired,
    label: PropTypes.string,
    loading: PropTypes.bool
};

export default withStyles(styleSheet)(ButtonSubmit);
