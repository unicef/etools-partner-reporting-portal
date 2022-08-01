import PropTypes from 'prop-types'
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

PageContent.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(PageContent);

