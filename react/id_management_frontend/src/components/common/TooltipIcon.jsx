import React from 'react';
import PropTypes from 'prop-types';
import InfoIcon from '@material-ui/icons/Info';
import {withStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const styleSheet = theme => ({
    infoIcon: {
        fill: theme.palette.text.secondary,
        '&:hover': {
            fill: theme.palette.text.primary,
        },
    },
    tooltipText: {
        whiteSpace: 'pre-line',
        maxWidth: '50vw',
    },
});

const TooltipIcon = (props) => {
    const {
        classes,
        name,
        icon: Icon,
        iconClass,
        infoText,
        displayTooltip,
        tooltipProps,
        ...other
    } = props;
    return (
        <Tooltip
            id={`${name}-button`}
            title={infoText}
            disabled={!displayTooltip}
            classes={{popper: classes.tooltipText}}
            {...tooltipProps}
        >
            <Icon
                className={`${iconClass} ${classes.infoIcon}`}
                {...other}
            />
        </Tooltip>
    );
};


TooltipIcon.propTypes = {
    classes: PropTypes.object,
    /**
     * Icon to be displayed
     */
    icon: PropTypes.func,
    /**
     * text/component displayed inside tooltip
     */
    infoText: PropTypes.node,
    /**
     * class for the icon
     */
    iconClass: PropTypes.string,
    /**
     * whether tooltip should be displayed at all
     */
    displayTooltip: PropTypes.bool,
    /**
     * name to build unique id with
     */
    name: PropTypes.string,
    /**
     * props passed to tooltip
     */
    tooltipProps: PropTypes.object,
};

TooltipIcon.defaultProps = {
    displayTooltip: true,
    icon: InfoIcon,
};

export default withStyles(styleSheet, {name: 'TooltipIcon'})(TooltipIcon);
