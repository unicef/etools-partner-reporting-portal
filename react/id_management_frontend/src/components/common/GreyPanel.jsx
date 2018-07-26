import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";

const styleSheet = (theme) => ({
    panel: {
        backgroundColor: '#F9F9F9',
        padding: theme.spacing.unit * 2
    }
});

class GreyPanel extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <div className={classes.panel}>
                {children}
            </div>
        )
    }
}

export default withStyles(styleSheet)(GreyPanel);