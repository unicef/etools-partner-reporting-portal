import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import TooltipIcon from '../TooltipIcon';

describe('TooltipIcon component', () => {
    it('renders the component', () => {
        const classes = {};
        const icon = jest.fn();
        const infoText = <p>I am text</p>;
        const iconClass = 'icon';
        const displayTooltip = false;
        const name = 'name';
        const tooltipProps = {};

        const wrapper = shallow(<TooltipIcon
            classes={classes}
            icon={icon}
            infoText={infoText}
            iconClass={iconClass}
            displayTooltip={displayTooltip}
            name={name}
            tooltipProps={tooltipProps}
        />);

        expect(wrapper.dive()).toBeTruthy();
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});