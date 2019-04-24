import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldLabelWithTooltip from '../FieldLabelWithTooltip';
import TooltipIcon from '../TooltipIcon';

describe('FieldLabelWithTooltip component', () => {
    it('renders properly', () => {
        const children = <div></div>
        const classes = {};
        const infoText = 'help';
        const tooltipIconProps = {};
        const labelProps = {};

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
        const newInfoText = '';
        const children = <div></div>
        const classes = {};
        const tooltipIconProps = {};
        const labelProps = {};

        const wrapper = shallow(<FieldLabelWithTooltip
            children={children}
            classes={classes}
            infoText={newInfoText}
            tooltipIconProps={tooltipIconProps}
            labelProps={labelProps}
        />);

        expect(wrapper.contains(<TooltipIcon/>)).toBe(false);
    });
});