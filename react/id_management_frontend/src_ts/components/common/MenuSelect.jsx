import React, {Component} from "react";
import {InputLabel, Select, MenuItem} from "@material-ui/core";
import PropTypes from "prop-types";
import FilterInput from "./FilterInput";
import labels from "../../labels";

class MenuSelect extends Component {
    render() {
        const {label, name, options, value, onChange} = this.props;

        return (
            <FilterInput>
                <InputLabel htmlFor={name}>{label}</InputLabel>
                <Select
                    value={value}
                    onChange={onChange}
                    inputProps={{
                        name: name,
                        id: name
                    }}
                >
                    <MenuItem value="">
                        <em>{labels.none}</em>
                    </MenuItem>
                    {options.map((option, idx) => (
                        <MenuItem key={idx} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FilterInput>
        );
    }
}

MenuSelect.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.any.isRequired
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
};

export default MenuSelect;
