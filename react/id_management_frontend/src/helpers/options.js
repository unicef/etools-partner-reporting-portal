export function optionsFromChoices(choices) {
    return choices.map(choice => ({
        value: choice.value,
        label: choice.display_name
    }));
}
export function filterOptionsValues(options, values) {
    return options.filter(option => values.indexOf(option.value) < 0);
}
