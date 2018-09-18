import * as R from "ramda";
import React from "react";
import {FormControl, FormHelperText, Select} from "@material-ui/core/";
import FieldLabelWithTooltipIcon from '../../common/FieldLabelWithTooltip';
import {RenderMultipleSelections, RenderPlaceholder} from "./selectRenderers";

export const renderSelectField = (
    {
        input,
        defaultValue,
        meta: {touched, error, warning},
        children,
        multiple,
        label,
        values,
        placeholder,
        formControlStyle,
        infoText,
        ...other
    }
) => {
    let valueForSelect;
    if (multiple) {
        valueForSelect = (!R.isEmpty(input.value) && input.value) || defaultValue || ['placeholder_none'];
    } else {
        valueForSelect = input.value || defaultValue || 'placeholder_none';
    }
    return (<FormControl fullWidth style={formControlStyle} error={(touched && !!error) || warning}>
        <FieldLabelWithTooltipIcon
            infoText={infoText}
            tooltipIconProps={{
                name: input.name,
            }}
        >
            {label}
        </FieldLabelWithTooltipIcon>
        <Select
            {...input}
            value={valueForSelect}
            multiple={multiple}
            style={{marginTop: 0}}
            renderValue={(value) => {
                if (value === 'placeholder_none' || R.indexOf('placeholder_none', value) !== -1) {
                    return (<RenderPlaceholder placeholder={placeholder}/>);
                }
                if (Array.isArray(value)) {
                    const selectedValues = R.filter(
                        R.propSatisfies(prop => value.includes(prop), 'value'),
                        values,
                    );
                    return (<RenderMultipleSelections
                        fieldName={input.name}
                        onSelectionRemove={(removedValue) => {
                            input.onChange(R.without([removedValue], value));
                        }}
                        selectedValues={selectedValues}
                    />);
                }
                const selectedValue = R.find(R.propEq('value', value))(values) || {};
                return R.prop('label', selectedValue);
            }}
            onBlur={(event) => {
                event.preventDefault();
            }}
            {...other}
        >
            {children}
        </Select>
        {((touched && error) || warning) && <FormHelperText>{error || warning}</FormHelperText>}
    </FormControl>);
};