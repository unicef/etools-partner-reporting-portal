import React from 'react';
import {Field} from 'redux-form';
import PropTypes from 'prop-types';
import {required, warning} from '../../helpers/validation';
import {renderText} from "./helpers/renderText";
import {renderTextField} from "./helpers/renderTextField";


function TextFieldForm(props) {
    const {
        fieldName,
        label,
        textFieldProps,
        placeholder,
        optional,
        validation,
        warn,
        normalize,
        readOnly,
        infoText,
        formControlStyle,
        format
    } = props;

    return (
        <div>
            {readOnly
                ? <Field
                    name={fieldName}
                    label={label}
                    component={renderText}
                    optional={optional}
                    infoText={infoText}
                    {...textFieldProps}
                />
                : <Field
                    name={fieldName}
                    placeholder={placeholder || `Provide ${label.toLowerCase()}`}
                    component={renderTextField}
                    label={label}
                    validate={(optional ? (validation || []) : [required].concat(validation || []))}
                    normalize={normalize}
                    infoText={infoText}
                    warn={warn ? warning : null}
                    formControlStyle={formControlStyle}
                    format={format}
                    required={!optional}
                    {...textFieldProps}
                />
            }
        </div>
    );
}


TextFieldForm.propTypes = {
    /**
     * Name of the field used by react-form and as unique id.
     */
    fieldName: PropTypes.string.isRequired,
    /**
     * label used in field, also placeholder is built from it by adding 'Provide'
     */
    label: PropTypes.node,
    /**
     * props passed to wrapped TextField
     */
    textFieldProps: PropTypes.object,
    /**
     * unique text used as placeholder
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
     * validations passed to field
     */
    warn: PropTypes.bool,
    /**
     * if form should be displayed in read only state
     */
    readOnly: PropTypes.bool,
    /**
     * for some text format, i.e. parseInt
     */
    normalize: PropTypes.func,
    /**
     * Formats the value from the Redux store to be displayed in the field input.
     */
    format: PropTypes.func,
    /**
     * text for tooltip icon
     */
    infoText: PropTypes.node,

    formControlStyle: PropTypes.object,

    commentFormControlStyle: PropTypes.object,
};

TextFieldForm.defaultProps = {
    placeholder: null,
};


export default TextFieldForm;
