import { jsx as _jsx } from "react/jsx-runtime";
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { CircularProgress } from "@material-ui/core";
import LoadingIndicator from '../LoadingIndicator';
describe('LoadingIndicator component', () => {
    const classes = { absolute: 'test' };
    it('renders the component', () => {
        const absolute = true;
        const wrapper = shallow(_jsx(LoadingIndicator, { absolute: absolute, classes: classes }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    it('sets the className properly when absolute is true', () => {
        const absolute = true;
        const wrapper = mount(_jsx(LoadingIndicator, { absolute: absolute, classes: classes }, void 0));
        expect(wrapper.find(CircularProgress).hasClass('test')).toBe(true);
    });
    it('has no className when absolute is false', () => {
        const absolute = false;
        const wrapper = mount(_jsx(LoadingIndicator, { absolute: absolute, classes: classes }, void 0));
        expect(wrapper.find(CircularProgress).hasClass('test')).toBe(false);
    });
});
