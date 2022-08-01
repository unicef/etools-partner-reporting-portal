import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import TooltipIcon from '../TooltipIcon';
describe('TooltipIcon component', () => {
    it('renders the component', () => {
        const classes = {};
        const icon = jest.fn();
        const infoText = _jsx("p", { children: "I am text" }, void 0);
        const iconClass = 'icon';
        const displayTooltip = false;
        const name = 'name';
        const tooltipProps = {};
        const wrapper = shallow(_jsx(TooltipIcon, { classes: classes, icon: icon, infoText: infoText, iconClass: iconClass, displayTooltip: displayTooltip, name: name, tooltipProps: tooltipProps }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
