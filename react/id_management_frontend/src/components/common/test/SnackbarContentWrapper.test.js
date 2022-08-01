import { jsx as _jsx } from "react/jsx-runtime";
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import IconButton from "@material-ui/core/IconButton";
import SnackbarContentWrapper from '../SnackbarContentWrapper';
describe('SnackbarContentWrapper component', () => {
    const classes = {};
    const className = 'coolClass';
    const message = _jsx("p", { children: "This is a message" }, void 0);
    const onClose = jest.fn();
    const variant = 'error';
    const other = {};
    it('renders the component correctly', () => {
        const wrapper = shallow(_jsx(SnackbarContentWrapper, { classes: classes, className: className, message: message, onClose: onClose, variant: variant, other: other }, void 0));
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    it('calls onClick correctly', () => {
        const wrapper = mount(_jsx(SnackbarContentWrapper, { classes: classes, className: className, message: message, onClose: onClose, variant: variant, other: other }, void 0));
        wrapper.find(IconButton).simulate('click');
        const calls = onClose.mock.calls;
        expect(calls.length).toBe(1);
    });
});
