/* eslint-disable react/prop-types */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import {FormControl, FormHelperText} from '@material-ui/core';
import FieldLabelWithTooltipIcon from '../../common/FieldLabelWithTooltip';

export const renderTextField = (
    {
        name,
        className,
        meta: {touched, error, warning},
        input,
        label,
        infoText,
        formControlStyle,
        ...other
    }
) => (<FormControl fullWidth style={formControlStyle}>
    <FieldLabelWithTooltipIcon
        infoText={infoText}
        tooltipIconProps={{
            name: input.name,
        }}
    >
        {label}
    </FieldLabelWithTooltipIcon>
    <TextField
        className={className}
        id={input.name}
        error={(touched && !!error) || !!warning}
        fullWidth
        {...input}
        {...other}
    />
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {((touched && error) || warning) && <FormHelperText error>{error || warning}</FormHelperText>}
    </div>
</FormControl>);
