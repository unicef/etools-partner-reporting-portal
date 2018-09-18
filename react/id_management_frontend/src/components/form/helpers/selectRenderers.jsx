/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {MenuItem, Divider, Typography} from '@material-ui/core/';
import Close from '@material-ui/icons/Close';
import PaddedContent from '../../common/PaddedContent';

export const PLACEHOLDER_VALUE = 'placeholder_none';

const placeholderStyleSheet = theme => ({
    placeholder: {
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        color: 'currentColor',
        opacity: theme.palette.type === 'light' ? 0.42 : 0.5,
        font: 'inherit',
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.ease,
        }),
    },
});

function renderPlaceholderBase({classes, placeholder}) {
    return (<Typography className={classes.placeholder}>
            {placeholder}
        </Typography>
    );
}

renderPlaceholderBase.propTypes = {
    classes: PropTypes.object,
    placeholder: PropTypes.string,
};
export const RenderPlaceholder = withStyles(placeholderStyleSheet, {name: 'selectPlaceholder'})(renderPlaceholderBase);


const multipleSelectionsStyleSheet = (theme) => {
    const padding = theme.spacing.unit;

    return {
        label: {
            padding: `0 ${padding}px 0 0`,
        },
        close: {
            fill: theme.palette.primary.main,
            fontSize: '18px'
        },
        rowContainer: {
            display: 'flex',
            alignItems: 'center',
        },
        itemsContainer: {
            display: 'flex',
            flexWrap: 'wrap'
        },
    };
};

function renderMultipleSelectionsBase({classes, fieldName, onSelectionRemove, selectedValues}) {
    return (<div className={`${classes.itemsContainer}`}>
        {selectedValues.map(item => (<div
            key={`${fieldName}_selection_item_${item.value}`}
            className={classes.rowContainer}
        >
            <Close
                className={classes.close}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelectionRemove(item.value);
                }}
            />
            <div className={classes.label}>
                {item.label}
            </div>
        </div>))}
    </div>);
}

renderMultipleSelectionsBase.propTypes = {
    classes: PropTypes.object,
    fieldName: PropTypes.string,
    onSelectionRemove: PropTypes.func,
    selectedValues: PropTypes.array,
};
export const RenderMultipleSelections = withStyles(multipleSelectionsStyleSheet, {name: 'selectMultipleSelections'})(renderMultipleSelectionsBase);

const selectionItemStyleSheet = theme => ({
    root: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
        '&:focus': {
            backgroundColor: 'transparent',
        },
        '&:hover': {
            backgroundColor: `${theme.palette.text.divider}`,
        },

    },
    selected: {
        color: theme.palette.primary.main,
        backgroundColor: 'white',
    },
});

function SelectionItemBase({classes, label, ...props}) {
    return (<MenuItem
            classes={{selected: classes.selected, root: classes.root}}
            {...props}
        >{label}
        </MenuItem>
    );
}

SelectionItemBase.propTypes = {
    classes: PropTypes.object,
    label: PropTypes.string,
};

const SelectionItem = withStyles(selectionItemStyleSheet, {name: 'selectionItem'})(SelectionItemBase);


export function renderSelectOptions(fieldName, values, sections) {
    return (
        // this is hack to get placeholder in place, display hidden option that is preselected
        // by default
        [<SelectionItem
            value={PLACEHOLDER_VALUE}
            label={PLACEHOLDER_VALUE}
            key={`${fieldName}_${PLACEHOLDER_VALUE}`}
            disabled
            style={{
                display: 'none',
                width: 0,
                height: 0,
            }}
        />,
            ...(sections
                ? values.map(([sectionName, sectionValues], index) => [
                    <PaddedContent>
                        <Typography
                            type="body2"
                            key={`${fieldName}_sectionName_${index}`}
                        >{sectionName}
                        </Typography>
                        <Divider key={`${fieldName}_divider_${index}`}/>
                    </PaddedContent>,
                    sectionValues.map(selectionValue => (
                        <SelectionItem
                            key={`${fieldName}_menuItem_${selectionValue.value}`}
                            value={selectionValue.value}
                            label={selectionValue.label}
                        />)),
                ])
                : values.map(selectionValue => (
                    <SelectionItem
                        key={`${fieldName}_menuItem_${selectionValue.value}`}
                        value={selectionValue.value}
                        label={selectionValue.label}
                    />
                ))),
        ]
    );
}
