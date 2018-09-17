import React, {Component} from "react";
import PropTypes from "prop-types";
import SmallText from "./SmallText";

class SmallValue extends Component {
    render() {
        const {label, value} = this.props;

        return (
            <div>
                <SmallText label block>{label}</SmallText>
                <SmallText block>{value}</SmallText>
            </div>
        );
    }
}

SmallValue.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.any
};

export default SmallValue;
