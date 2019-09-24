import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldLabelWithTooltip from '../FieldLabelWithTooltip';
import TooltipIcon from '../TooltipIcon';

describe('FieldLabelWithTooltip component', () => {
    const children = <div></div>
    const classes = {};
    const tooltipIconProps = {};
    const labelProps = {};
    
    it('renders properly', () => {
        const infoText = 'help';

        const wrapper = shallow(<FieldLabelWithTooltip
            children={children}
            classes={classes}
            infoText={infoText}
            tooltipIconProps={tooltipIconProps}
            labelProps={labelProps}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('renders null if infoText is falsy', () => {
        const infoText = '';

        const wrapper = mount(<FieldLabelWithTooltip
            children={children}
            classes={classes}
            infoText={infoText}
            tooltipIconProps={tooltipIconProps}
            labelProps={labelProps}
        />);

        expect(wrapper.exists(TooltipIcon)).toBe(false);
    });
});