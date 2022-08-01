import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import Snackbar from '../Snackbar';
describe('Snackbar component', () => {
    it('renders the component properly', () => {
        const message = 'This is a message!';
        const onClose = jest.fn();
        const open = false;
        const variant = 'variant';
        const wrapper = shallow(_jsx(Snackbar, { message: message, onClose: onClose, open: open, variant: variant }, void 0));
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
