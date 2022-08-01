import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {Typography} from '@material-ui/core'
import SmallText from '../SmallText';

describe('SmallText component', () => {
    const gutterBottom = false;
    const children = <div></div>;
    const classes = {block: 'block', text: 'text'};

    it('renders the component', () => {
        const block = false;
        const label = false;

        const wrapper = shallow(<SmallText
            block={block}
            label={label}
            gutterBottom={gutterBottom}
            children={children}
            classes={classes}
        />);

        expect(wrapper.dive()).toBeTruthy();
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('sets the color and className attributes correctly when label and block are true', () => {
        const block = true;
        const label = true;

        const wrapper = mount(<SmallText
            block={block}
            label={label}
            gutterBottom={gutterBottom}
            children={children}
            classes={classes}
        />);

        expect(wrapper.find(Typography).hasClass('block')).toBe(true);
        expect(wrapper.find(Typography).prop('color')).toBe('default');
    });

    it('sets the color and className attributes correctly when label and block are false', () => {
        const block = false;
        const label = false;

        const wrapper = mount(<SmallText
            block={block}
            label={label}
            gutterBottom={gutterBottom}
            children={children}
            classes={classes}
        />);

        expect(wrapper.find(Typography).hasClass('block')).toBe(false);
        expect(wrapper.find(Typography).prop('color')).toBe('inherit');
    });
});