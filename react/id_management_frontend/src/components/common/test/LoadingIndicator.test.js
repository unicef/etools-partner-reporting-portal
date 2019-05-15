import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {CircularProgress} from "@material-ui/core";
import LoadingIndicator from '../LoadingIndicator';

describe('LoadingIndicator component', () => {
    const classes = {absolute: 'test'};
    
    it('renders the component', () => {
        const absolute = true;
        const wrapper = shallow(<LoadingIndicator
            absolute={absolute}
            classes={classes}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('sets the className properly when absolute is true', () => {
        const absolute = true;
        const wrapper = mount(<LoadingIndicator
            absolute={absolute}
            classes={classes}
        />);

        expect(wrapper.find(CircularProgress).hasClass('test')).toBe(true);
    });

    it('has no className when absolute is false', () => {
        const absolute = false;
        const wrapper = mount(<LoadingIndicator
            absolute={absolute}
            classes={classes}
        />);

        expect(wrapper.find(CircularProgress).hasClass('test')).toBe(false);
    });
});