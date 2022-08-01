import { jsx as _jsx } from "react/jsx-runtime";
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { Button } from "@material-ui/core";
import AoAlert from '../AoAlert';
describe('AoAlert component', () => {
    const classes = {};
    const onClick = jest.fn();
    const wrapper = shallow(_jsx(AoAlert, { classes: classes, onClick: onClick }, void 0));
    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    it('calls click correctly', () => {
        const wrapper = mount(_jsx(AoAlert, { classes: classes, onClick: onClick }, void 0));
        wrapper.find(Button).simulate('click');
        const calls = onClick.mock.calls;
        expect(calls.length).toBe(1);
    });
});
