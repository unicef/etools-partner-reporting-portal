import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import DialogActions from '../DialogActions';
describe('DialogActions component', () => {
    it('renders properly', () => {
        const classes = {};
        const children = {};
        const wrapper = shallow(_jsx(DialogActions, { classes: classes, children: children }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
