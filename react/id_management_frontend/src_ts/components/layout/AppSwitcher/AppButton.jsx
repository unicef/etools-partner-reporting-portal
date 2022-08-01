import PropTypes from 'prop-types'
import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import grey from "@material-ui/core/colors/grey"
import classNames from 'classnames';

const appSubtext = "USER MANAGEMENT";

const styleSheet = {
    appButton: {
        padding: '35px 40px'
    },
    disabled: {
        backgroundColor: grey[200],
        pointerEvents: 'none'
    },
    appName: {
        width: 130,
        textAlign: 'left'
    },
    appSubtext: {
        color: grey[600]
    }
};

class AppButton extends Component {
    render() {
        const {name, classes, onClick, disabled} = this.props;

        const buttonClasses = classNames([classes.appButton, disabled && classes.disabled]);

        return (
            <Button className={buttonClasses} onClick={onClick}>
                <div className={classes.appName}>
                    {name}
                    <div className={classes.appSubtext}>
                        {appSubtext}
                    </div>
                </div>
            </Button>
        )
    }
}

AppButton.propTypes = {
    classes: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styleSheet)(AppButton);

