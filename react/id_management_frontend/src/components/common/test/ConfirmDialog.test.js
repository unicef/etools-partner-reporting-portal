import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConfirmDialog from '../ConfirmDialog';
describe('ConfirmDialog component', () => {
    it('renders component properly', () => {
        const open = true;
        const onClose = jest.fn();
        const title = 'hello';
        const message = 'some message';
        const onConfirm = jest.fn();
        const wrapper = shallow(_jsx(ConfirmDialog, { open: open, onClose: onClose, title: title, message: message, onConfirm: onConfirm }, void 0));
        expect(toJSON(wrapper)).toMatchSnapshot();
        expect(wrapper.shallow().length).toBe(1);
    });
});
