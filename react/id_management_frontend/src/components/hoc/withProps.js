import {connect} from "react-redux";

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
