export function optionsFromChoices(choices) {
    return choices.map(choice => ({
        value: choice.value,
        label: choice.display_name
    }));
}