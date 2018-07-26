import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";

const styleSheet = (theme) => ({
    content: {
        padding: theme.spacing.unit * 3
    }
});

class PageContent extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <div className={classes.content}>
                {children}
            </div>
        )
    }
}

export default withStyles(styleSheet)(PageContent);