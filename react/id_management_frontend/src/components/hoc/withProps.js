import {connect} from "react-redux";

/*
* This component maps prop functions - passed with
* @param props
* to name of those functions allowing quick access to store data
* */

export default function withProps(...props) {
    function _withProps(WrappedComponent) {
        const mapStateToProps = (state) => {
            let _props = {};

            props.forEach(prop => {
                _props[prop.name] = prop(state);
            });

            return _props;
        };

        return connect(mapStateToProps)(WrappedComponent);
    }

    return _withProps;
}
