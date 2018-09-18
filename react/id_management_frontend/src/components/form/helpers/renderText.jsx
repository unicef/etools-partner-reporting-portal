import * as R from "ramda";
import Typography from '@material-ui/core/Typography';
import {FormControl} from '@material-ui/core/';
import FieldLabelWithTooltipIcon from '../../common/FieldLabelWithTooltip';
import React from 'react';

export const renderText = (
    {
        className,
        input,
        values,
        optional,
        label,
        infoText,
        date,
        meta,
        multiline,
        inputProps,
        InputProps,
        ...other
    }
) => {
    let value = (!R.isNil(input.value) && !R.isEmpty(input.value))
        ? input.value
        : (InputProps
            ? InputProps.inputProps.initial
            : null);

    if (!value) value = '-';

    if (values) {
        value = R.filter((val) => {
            if (Array.isArray(value)) return value.includes(val.value);
            return value === val.value;
        }, values).map(matchedValue => matchedValue.label).join(', ');
    }

    if (R.isEmpty(value) || R.isNil(value)) {
        value = (!R.isNil(input.value) && !R.isEmpty(input.value))
            ? input.value
            : (InputProps
                ? InputProps.inputProps.initial
                : null);
    }
    if (R.isEmpty(value) || R.isNil(value)) value = '-';

    return (
        <FormControl fullWidth>
            {label && <FieldLabelWithTooltipIcon
                infoText={infoText}
                tooltipIconProps={{
                    name: input.name,
                }}
            >
                {label}
            </FieldLabelWithTooltipIcon>}
            <div style={{display: 'flex', alignItems: 'center'}}>
                <Typography
                    className={className}
                    style={{whiteSpace: 'pre-wrap'}}
                    {...other}
                    variant="subheading"
                >
                    {Array.isArray(value) ? value.join(', ') : value}
                </Typography>
            </div>
        </FormControl>
    );
};