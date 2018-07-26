import React from 'react';
import PropTypes from 'prop-types';
import { FormLabel } from '@material-ui/core/';
import { withStyles } from '@material-ui/core/styles';
import classname from 'classnames';
import TooltipIcon from './TooltipIcon';

const styleSheet = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '4px',
  },
  label: {
    fontSize: '0.75rem',
    transform: 'scale(1)',
  },
  icon: {
    transform: 'scale(0.75)',
  },
  iconPadding: {
    marginRight: theme.spacing.unit,
  },
});

const FieldLabelWithTooltip = (props) => {
  const { classes,
    children,
    infoText,
    tooltipIconProps,
    labelProps,
  } = props;
  const labelClass = classname(
    classes.label,
    {
      [classes.iconPadding]: infoText,
    },
  );
  return (
    <div className={classes.root}>
      <FormLabel className={labelClass} {...labelProps} >
        {children}
      </FormLabel>
      {infoText ? <TooltipIcon
        infoText={infoText}
        iconClass={classes.icon}
        {...tooltipIconProps}
      />
        : null}
    </div>
  );
};


FieldLabelWithTooltip.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  /**
   * text/component displayed inside tooltip
   */
  infoText: PropTypes.node,
  /**
   * whether tooltip should be displayed at all
   */
  displayTooltip: PropTypes.bool,
  /**
   * props passed to tooltip icon
   */
  tooltipIconProps: PropTypes.object,
  /**
   * props passed to label
   */
  labelProps: PropTypes.object,
};

export default withStyles(styleSheet, { name: 'FieldLabelWithTooltip' })(FieldLabelWithTooltip);
