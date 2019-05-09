import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {PagingState} from '@devexpress/dx-react-grid';
import {TableRowDetail} from "@devexpress/dx-react-grid-material-ui";
import {PaginatedList,
    mapStateToProps,
    mapDispatchToProps} from '../PaginatedList';

describe('PaginatedList component', () => {
    const columns = [];
    const columnExtensions = [];
    const alternativeSorting = [
        {orderingNames: ['Levine', 'Rowling']},
        {orderingNames: ['Pope', 'Ma']},
        {orderingNames: ['Snicket', 'Davis']},
    ];
    const data = {results: []};
    const expandedCell = jest.fn();
    const page = 451;
    const onPageChange = jest.fn();
    const onDelete = jest.fn();
    const showDelete = false;
    const showRestore = false;
    const allowSorting = false;
    const loading = false;
    const onEdit = jest.fn();
    const showEdit = false;
    const onExpandedRowIdsChange = jest.fn();
    const classes = {};
    const sorting = [{columnName: 'Druckmann'}, {columnName: 'Pope'}, {columnName: 'Miyazaki'}];

    const wrapper = shallow(<PaginatedList
        columns={columns}
        columnExtensions={columnExtensions}
        alternativeSorting={alternativeSorting}
        data={data}
        expandedCell={expandedCell}
        page={page}
        onPageChange={onPageChange}
        onDelete={onDelete}
        showDelete={showDelete}
        showRestore={showRestore}
        allowSorting={allowSorting}
        loading={loading}
        onEdit={onEdit}
        showEdit={showEdit}
        onExpandedRowIdsChange={onExpandedRowIdsChange}
        classes={classes}
        sorting={sorting}
    />);

    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('renders the header', () => {
        const instance = wrapper.instance();
        const header = shallow(instance.header());

        expect(header.find('div')).toBeTruthy();
    });

    it('runs mapStateToProps correctly', () => {
        const state = {expandedRowIds: 'test'};
        const map = mapStateToProps(state);

        expect(map).toEqual(state);
    });

    it('runs mapDispatchToProps correctly', () => {
        const dispatch = item => item;
        const id = 5;
        const dispatched = mapDispatchToProps(dispatch);
        const result = {'ids': 5, 'type': 'EXPANDED_ROW_IDS'};

        expect(dispatched.dispatchExpandedRowIds(id)).toEqual(result);
    });

    it('runs onPageChange function when onCurrentPageChange prop is called', () => {
        expect(wrapper.find(PagingState).prop('currentPage')).toBe(450);
        wrapper.find(PagingState).prop('onCurrentPageChange')();

        const calls = onPageChange.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs expandedCell function when contentComponent prop is called', () => {
        const row = {row: 5};

        wrapper.find(TableRowDetail).prop('contentComponent')({row});
        const calls = expandedCell.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs computeInnerSorting correctly when alternativeSorting is truthy', () => {
        const instance = wrapper.instance();

        const sorted = instance.computeInnerSorting(sorting);
        expect(sorted).toEqual([{columnName: 'Druckmann'}, {columnName: 'Miyazaki'}]);
    });
});