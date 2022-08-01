import { jsx as _jsx } from "react/jsx-runtime";
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldLabelWithTooltip from '../FieldLabelWithTooltip';
import TooltipIcon from '../TooltipIcon';
describe('FieldLabelWithTooltip component', () => {
    const children = _jsx("div", {}, void 0);
    const classes = {};
    const tooltipIconProps = {};
    const labelProps = {};
    it('renders properly', () => {
        const infoText = 'help';
        const wrapper = shallow(_jsx(FieldLabelWithTooltip, { children: children, classes: classes, infoText: infoText, tooltipIconProps: tooltipIconProps, labelProps: labelProps }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    it('renders null if infoText is falsy', () => {
        const infoText = '';
        const wrapper = mount(_jsx(FieldLabelWithTooltip, { children: children, classes: classes, infoText: infoText, tooltipIconProps: tooltipIconProps, labelProps: labelProps }, void 0));
        expect(wrapper.exists(TooltipIcon)).toBe(false);
    });
});
