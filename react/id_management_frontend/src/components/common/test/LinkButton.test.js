import { jsx as _jsx } from "react/jsx-runtime";
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import LinkButton from '../LinkButton';
describe('LinkButton component', () => {
    const classes = {};
    const label = 'Hello';
    const onClick = jest.fn();
    const variant = 'danger';
    const wrapper = shallow(_jsx(LinkButton, { classes: classes, label: label, onClick: onClick, variant: variant }, void 0));
    it('renders properly', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    it('calls click properly', () => {
        wrapper.simulate('click');
        const calls = onClick.mock.calls;
        expect(calls.length).toBe(1);
    });
    it('has the correct label', () => {
        const newWrapper = mount(_jsx(LinkButton, { classes: classes, label: label, onClick: onClick, variant: variant }, void 0));
        const nodeText = newWrapper.find('div').text();
        expect(nodeText).toBe('Hello');
    });
});
