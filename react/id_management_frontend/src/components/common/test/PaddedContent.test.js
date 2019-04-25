import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import PaddedContent from '../PaddedContent';

describe('PaddedContent component', () => {
    const classes = {container: 'hi', containerBig: 'HELLO'};
    const children = <div></div>;
    const big = false;
    const className = 'hi';

    it('renders properly', () => {
        const wrapper = shallow(<PaddedContent
            classes={classes}
            children={children}
            big={big}
            className={className}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});