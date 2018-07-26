import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import grey from "@material-ui/core/colors/grey"
import classNames from 'classnames';

const labels = {
    appSubtext: "USER MANAGEMENT"
};

const styleSheet = {
    appButton: {
        padding: '35px 40px'
    },
    disabled: {
        backgroundColor: grey[200]
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
                        {labels.appSubtext}
                    </div>
                </div>
            </Button>
        )
    }
}

export default withStyles(styleSheet)(AppButton);