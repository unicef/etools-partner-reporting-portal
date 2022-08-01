import React, {Component, Fragment} from "react";
import {components} from 'react-select';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import {required} from "../../helpers/validation";
import {Field} from "redux-form";
import {Close, Search, Check} from "@material-ui/icons";
import classNames from "classnames";
import Async from 'react-select/lib/Async';
import * as R from 'ramda';
import {FormControl, FormHelperText} from "@material-ui/core";

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 250,
    },
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
    },
    wrap: {
        flexWrap: 'wrap',
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },

    withIcon: {
        left: 32
    },


    divider: {
        height: theme.spacing.unit * 2,
    },

    label: {
        padding: `0 ${theme.spacing.unit}px 0 0`,
    },
    close: {
        fill: theme.palette.primary.main,
        fontSize: '18px'
    },
    rowContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    searchWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 5
    },
    listIcon: {
        marginRight: theme.spacing.unit,
        fontWeight: 500
    },
    fieldWrapper: {
        position: "relative",
    },
    inputWrapper: {
        padding: theme.spacing.unit * 2
    }
});

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({inputRef, ...props}) {
    return <div ref={inputRef} {...props} />;
}

function SelectContainer(props) {
    if (props.selectProps.menuIsOpen) {
        const holderStyle = {
            height: props.selectProps.fieldWrapperRef.clientHeight
        };

        return (
            <Fragment>
                <div style={holderStyle}/>
                <Grow in={true} style={{transformOrigin: '0 0 0'}}>
                    <Paper square className={props.selectProps.classes.searchWrapper}>
                        <components.SelectContainer {...props}/>
                    </Paper>
                </Grow>
            </Fragment>
        )
    }

    return <components.SelectContainer {...props}/>
}

function Control(props) {
    const classes = classNames({
        [props.selectProps.classes.inputWrapper]: props.selectProps.menuIsOpen
    });

    const {meta: {touched, error, warning}, required} = props.selectProps;
    let label = props.selectProps.menuIsOpen ? null : props.selectProps.textFieldProps.label;

    if (label && required) {
        label += ' *';
    }

    return (
        <FormControl fullWidth error={(touched && !!error) || warning}>
            <div className={classes}>
                <TextField
                    fullWidth
                    error={(touched && !!error) || !!warning}
                    InputProps={{
                        inputComponent,
                        inputProps: {
                            className: props.selectProps.classes.input,
                            inputRef: props.innerRef,
                            children: props.children,
                            ...props.innerProps,
                        },
                    }}
                    {...props.selectProps.textFieldProps}
                    label={label}
                />
            </div>
            {((touched && error) || warning) && <FormHelperText>{error || warning}</FormHelperText>}
        </FormControl>
    );
}

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.isSelected &&
            <Check className={props.selectProps.classes.listIcon}/>}
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    const classes = classNames(
        props.selectProps.classes.placeholder,
        {
            [props.selectProps.classes.withIcon]: props.showIcon
        }
    );

    return (
        <Fragment>
            {props.showIcon &&
            <Search/>}

            <Typography
                color="textSecondary"
                className={classes}
                {...props.innerProps}
            >
                {props.children}
            </Typography>
        </Fragment>
    );
}

function SingleValue(props) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    const classes = classNames(
        props.selectProps.classes.valueContainer,
        {
            [props.selectProps.classes.wrap]: props.selectProps.isMulti
        }
    );

    if (props.selectProps.menuIsOpen) {
        const input = props.children[1];

        return (
            <div className={classes}>
                <Placeholder {...props} showIcon>{input.props.value ? "" : "Search"}</Placeholder>
                {input}
            </div>
        );
    }

    return <div className={classes}>{props.children}</div>;
}

function MultiValue(props) {
    if (props.selectProps.menuIsOpen) {
        return null;
    }

    return (
        <div
            className={props.selectProps.classes.rowContainer}
        >
            <Close
                className={props.selectProps.classes.close}
                onClick={event => {
                    props.removeProps.onClick();
                    props.removeProps.onMouseDown(event);
                }}
            />
            <div className={props.selectProps.classes.label}>
                {props.children}
            </div>
        </div>
    );
}

function Menu(props) {
    return (
        <div {...props.innerProps}>
            {props.children}
        </div>
    );
}

function ClearIndicator(props) {
    if (props.selectProps.menuIsOpen) {
        return null;
    }

    return <components.ClearIndicator {...props}/>
}

function IndicatorSeparator(props) {
    if (props.selectProps.menuIsOpen) {
        return null;
    }

    return <components.IndicatorSeparator {...props}/>
}


function DropdownIndicator(props) {
    if (props.selectProps.menuIsOpen) {
        return null;
    }

    return <components.DropdownIndicator {...props}/>
}

const _components = {
    SelectContainer,
    Option,
    Control,
    NoOptionsMessage,
    Placeholder,
    SingleValue,
    MultiValue,
    ValueContainer,
    Menu,
    ClearIndicator,
    IndicatorSeparator,
    DropdownIndicator
};

class SearchSelectForm extends Component {
    constructor(props) {
        super(props);

        this.fieldWrapperRef = null;

        this.setFieldWrapperRef = (elem) => {
            this.fieldWrapperRef = elem
        };

        this.renderSelect = this.renderSelect.bind(this);
        this.getObject = this.getObject.bind(this);
        this.format = this.format.bind(this);
    }

    renderSelect({input, options, meta, required}) {
        const {classes, theme, placeholder, multiple, label, maxMenuHeight} = this.props;

        if (!options || !options.length) {
            return null;
        }

        const selectStyles = {
            input: base => ({
                ...base,
                color: theme.palette.text.primary,
            }),
        };

        return (
            <Async
                {...input}
                classes={classes}
                styles={selectStyles}
                meta={meta}
                required={required}
                textFieldProps={{
                    label: label,
                    InputLabelProps: {
                        shrink: true,
                    },
                }}
                components={_components}
                value={input.value || []}
                placeholder={placeholder || `Select ${label.toLowerCase()}`}
                isMulti={multiple}
                hideSelectedOptions={false}
                menuShouldBlockScroll={true}
                closeMenuOnSelect={!multiple}
                isClearable={multiple}
                backspaceRemovesValue={false}
                fieldWrapperRef={this.fieldWrapperRef}
                defaultOptions={true}
                loadOptions={this.loadOptions(options)}
                maxMenuHeight={maxMenuHeight}
            />
        )
    }

    loadOptions(options) {
        return (query) => {
            return new Promise((resolve) => {
                let result = options;

                if (query) {
                    result = R.filter(
                        R.propSatisfies(
                            str => str.toLowerCase().includes(query.toLowerCase()), 'label'
                        ), options
                    );
                }

                resolve(result.slice(0, 30));
            })
        };
    }

    normalize(val) {
        if (Array.isArray(val)) {
            return val.map(item => item.value);
        }

        return val.value;
    }

    format(val) {
        if (Array.isArray(val)) {
            return val.map(item => this.getObject(item));
        }

        return this.getObject(val);
    }

    getObject(val) {
        const {options} = this.props;
        // eslint-disable-next-line
        return options.filter(item => item.value == val)[0];
    }

    render() {
        const {
            fieldName,
            optional,
            validation,
            options,
            classes
        } = this.props;

        return (
            <div className={classes.fieldWrapper}
                 ref={this.setFieldWrapperRef}>
                <Field
                    name={fieldName}
                    component={this.renderSelect}
                    normalize={this.normalize}
                    format={this.format}
                    options={options}
                    required={!optional}
                    validate={(optional ? (validation || []) : [required].concat(validation || []))}
                />
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(SearchSelectForm);