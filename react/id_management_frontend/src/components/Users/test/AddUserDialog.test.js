import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import 'babel-polyfill';
import SearchSelectForm from "../../form/SearchSelectForm";
import ButtonSubmit from "../../common/ButtonSubmit";
import {EDITABLE_USER_TYPE_OPTIONS, USER_TYPE_OPTIONS} from "../../../constants";
import {AddUserDialog, mapStateToProps} from '../AddUserDialog';

jest.mock('../../../infrastructure/api', () => ({
    api: {
        post: jest.fn((url, data, params) => {
            if(data === 'hello!') {
                return Promise.resolve({data: 'success!'});
            } else {
                return Promise.resolve()
            }
        })
    }
}));

describe('AddUserDialog component', () => {
    const handleSubmit = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();
    const open = false;
    const partnerOptions = [];
    const portal = 'portal';
    const reset = jest.fn();
    const user = {prp_roles: [{is_active: true, role: 'CLUSTER_SYSTEM_ADMIN'}]};
    const user_type = 'type';

    const wrapper = shallow(<AddUserDialog
        handleSubmit={handleSubmit}
        onClose={onClose}
        onSave={onSave}
        open={open}
        partnerOptions={partnerOptions}
        portal={portal}
        reset={reset}
        user={user}
        user_type={user_type}
    />);

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('calls onClose method correctly', () => {
        wrapper.instance().onClose();

        const closeCalls = onClose.mock.calls;
        const resetCalls = reset.mock.calls;

        expect(closeCalls.length).toBe(1);
        expect(resetCalls.length).toBe(1);
    });

    it('calls onSubmit method correctly', () => {
        const saveCalls = onSave.mock.calls;
        const closeCalls = onClose.mock.calls;
        const state = wrapper.state();

        wrapper.instance().onSubmit('hello!')
            .then(() => {
                expect(saveCalls.length).toBe(1);
                expect(closeCalls.length).toBe(1);
                expect(state.loading).toBe(false);
            });
    });

    it('does not call onSave when there is no res or res.data', () => {
        const saveCalls = onSave.mock.calls;
        const closeCalls = onClose.mock.calls;
        const state = wrapper.state();

        wrapper.instance().onSubmit()
            .then(() => {
                expect(saveCalls.length).toBe(0);
                expect(closeCalls.length).toBe(1);
                expect(state.loading).toBe(false);
            });
    });

    it('calls mapStateToProps correctly', () => {
        const state = {user_type: 'yay'};
        const map = mapStateToProps(state);

        // FIX: hard to test because it relies on global Redux store
        expect(map).toEqual({user_type: undefined});
    });

    it('renders the correct child components with certain props', () => {
        const portal = 'cluster-reporting';
        const user_type = 'PARTNER';
        
        const wrapper = shallow(<AddUserDialog
            handleSubmit={handleSubmit}
            onClose={onClose}
            onSave={onSave}
            open={open}
            partnerOptions={partnerOptions}
            portal={portal}
            reset={reset}
            user={user}
            user_type={user_type}
        />);

        expect(wrapper.find('SelectForm').props().values).toEqual(USER_TYPE_OPTIONS);
        expect(wrapper.find(SearchSelectForm).props().options).toEqual([]);
        expect(wrapper.find(ButtonSubmit).props().label).toBe('Save and continue');

        expect(wrapper.find('SelectForm').props().fieldName).toBe('user_type');
        expect(wrapper.find(SearchSelectForm).props().fieldName).toBe('partner');
    });

    it('renders child components with correct props when given other props', () => {
        const portal = 'cluster-reporting';
        const user_type = 'CLUSTER_ADMIN';
        const user = {prp_roles: [{is_active: true, role: ''}]};
        
        const wrapper = shallow(<AddUserDialog
            handleSubmit={handleSubmit}
            onClose={onClose}
            onSave={onSave}
            open={open}
            partnerOptions={partnerOptions}
            portal={portal}
            reset={reset}
            user={user}
            user_type={user_type}
        />);

        expect(wrapper.find(ButtonSubmit).props().label).toBe('Save');
        expect(wrapper.find('SelectForm').props().values).toEqual([{label: 'Partner user', value: 'PARTNER'}]);
        expect(wrapper.find('SelectForm').props().fieldName).toBe('user_type');
    });
});