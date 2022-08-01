import React, {Component} from 'react';
import * as R from "ramda";
import {Field} from 'redux-form';
import PropTypes from 'prop-types';
import {required, warning} from '../../helpers/validation';
import {renderSelectOptions} from './helpers/selectRenderers';
import {renderText} from "./helpers/renderText";
import {renderSelectField} from "./helpers/renderSelectField";
import {Grid} from "@material-ui/core";

class SelectForm extends Component {
    constructor(props) {
        super(props);
        this.parseFormValue = this.parseFormValue.bind(this);
    }

    parseFormValue(value) {
        if (this.props.multiple) {
            return R.without('placeholder_none', value);
        }
        return value;
    }

    render() {
        const {
            fieldName,
            infoText,
            label,
            placeholder,
            selectFieldProps,
            values,
            warn,
            optional,
            validation,
            defaultValue,
            readOnly,
            formControlStyle,
            sections,
            multiple,
            textFieldProps,
            onChange
        } = this.props;

        return (
            <Grid item>
                {readOnly
                    ? <Field
                        name={fieldName}
                        component={renderText}
                        values={values}
                        optional={optional}
                        label={label}
                        infoText={infoText}
                        {...textFieldProps}
                    />
                    : <Field
                        name={fieldName}
                        component={renderSelectField}
                        parse={this.parseFormValue}
                        {...selectFieldProps}
                        label={label}
                        placeholder={placeholder || `Select ${label.toLowerCase()}`}
                        validate={(optional ? (validation || []) : [required].concat(validation || []))}
                        warn={warn ? warning : null}
                        defaultValue={defaultValue || multiple ? ['placeholder_none'] : 'placeholder_none'}
                        multiple={multiple}
                        formControlStyle={formControlStyle}
                        fullWidth
                        infoText={infoText}
                        values={sections ? R.reduce((current, [_, nextValues]) => R.concat(current, nextValues), [], values) : values}
                        onChange={onChange}
                    >
                        {renderSelectOptions(fieldName, values, sections)}
                    </Field>
                }
            </Grid>

        );
    }
}

SelectForm.propTypes = {
    /**
     * Name of the field used by react-form
     */
    fieldName: PropTypes.string.isRequired,
    /**
     * label used in field
     */
    label: PropTypes.node,
    /**
     * array of objects with values for menu items
     * {
     *   value: name of value represented by item
     *   label: label used for button
     * }
     */
    values: PropTypes.array.isRequired,
    /**
     * text passed to tooltip
     */
    infoText: PropTypes.string,
    /**
     * text passed as placeholder to field
     */
    placeholder: PropTypes.string,
    /**
     * if field is optional
     */
    optional: PropTypes.bool,
    /**
     * validations passed to field
     */
    validation: PropTypes.arrayOf(PropTypes.func),
    /**
     * if field should display warning
     */
    warn: PropTypes.bool,
    /**
     * props passed to wrapped SelectField
     */
    selectFieldProps: PropTypes.object,
    /**
     * if form should be displayed in read only state
     */
    readOnly: PropTypes.bool,
    /**
     * default value String
     */
    defaultValue: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ])),
        PropTypes.string,
        PropTypes.number,
    ]),
    /**
     * whether values should be divided into sections, expects this data format:
     * [sectionName: string, valuesForSection: [{value, label}] ]
     */
    sections: PropTypes.bool,
    /**
     * if select field should be multiple
     */
    multiple: PropTypes.bool,
    /**
     * props for read-only text field
     */
    textFieldProps: PropTypes.object,

    formControlStyle: PropTypes.object,
};

export default SelectForm;
