import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import PageHeader from '../PageHeader';

describe('PageHeader component', () => {
    const children = <div></div>;
    const classes = {};

    it('renders the component', () => {
        const wrapper = shallow(<PageHeader
            children={children}
            classes={classes}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});