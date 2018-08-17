import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ClassName from 'classnames';

const styleSheet = (theme) => {
    const padding = theme.spacing.unit * 2;
    const paddingBig = theme.spacing.unit * 3;

    return {
        container: {
            padding: `${padding}px ${padding}px`,
        },
        containerBig: {
            padding: `${paddingBig}px ${paddingBig}px`,
        },
    };
};

const PaddedContent = (props) => {
    const {classes, children, big, className: classNameProp} = props;
    const className = ClassName(
        {
            [classes.containerBig]: big,
            [classes.container]: !big,
        },
        classNameProp,
    );
    return (
        <div className={className}>
            {children}
        </div>
    );
};

PaddedContent.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node,
    big: PropTypes.bool,
    className: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string,
    ]),
};

export default withStyles(styleSheet, {name: 'PaddedContent'})(PaddedContent);
