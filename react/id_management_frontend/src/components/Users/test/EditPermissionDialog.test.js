import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { EditPermissionDialog } from '../EditPermissionDialog';
describe('EditPermissionDialog component', () => {
    const error = 'error';
    const handleSubmit = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();
    const open = false;
    const permission = {};
    const portal = 'portal';
    const roleOptions = [];
    const width = 'md';
    const wrapper = shallow(_jsx(EditPermissionDialog, { error: error, handleSubmit: handleSubmit, onClose: onClose, onSave: onSave, open: open, permission: permission, portal: portal, roleOptions: roleOptions, width: width }, void 0));
    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
