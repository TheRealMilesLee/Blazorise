import "./vendors/flatpickr.js?v=1.8.0.0";
import * as utilities from "./utilities.js?v=1.8.0.0";

const _pickers = [];

export function initialize(element, elementId, options) {
    element = utilities.getRequiredElement(element, elementId);

    if (!element)
        return;

    function mutationObserverCallback(mutationsList, observer) {
        mutationsList.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                if (mutation.target.id) {
                    // remove the special hidden id that we did before
                    const targetId = mutation.target.id.replace("flatpickr_hidden_", "");
                    const picker = _pickers[targetId];

                    if (picker && picker.altInput) {
                        const altInputClassListToRemove = [...picker.altInput.classList].filter(cn => !["input", "active"].includes(cn));
                        const inputClassListToAdd = [...picker.input.classList].filter(cn => !["flatpickr-input"].includes(cn));

                        altInputClassListToRemove.forEach(name => {
                            picker.altInput.classList.remove(name);
                        });

                        inputClassListToAdd.forEach(name => {
                            picker.altInput.classList.add(name);
                        });
                    }
                }
            }
        });
    }

    // When flatpickr is defined with altInput=true, it will create a second input
    // element while the original input element will be hidden. With MutationObserver
    // we can copy classnames from hidden to the visible element.
    const mutationObserver = new MutationObserver(mutationObserverCallback);
    mutationObserver.observe(document.getElementById(elementId), { attributes: true });

    const picker = flatpickr(element, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        allowInput: true,
        altInput: true,
        altFormat: options.displayFormat ? options.displayFormat : "H:i",
        defaultValue: options.default,
        minTime: options.min,
        maxTime: options.max,
        time_24hr: options.timeAs24hr ? options.timeAs24hr : false,
        clickOpens: !(utilities.coalesce(options.readOnly, false)),
        locale: options.localization || {},
        inline: utilities.coalesce(options.inline, false),
        disableMobile: utilities.coalesce(options.disableMobile, true),
        static: options.staticPicker,
        hourIncrement: options.hourIncrement,
        minuteIncrement: options.minuteIncrement,
        onReady: (selectedDates, dateStr, instance) => {
            // move the id from the hidden element to the visible element
            if (instance && instance.input && instance.input.parentElement) {
                const id = instance.input.id;
                const input = instance.input.parentElement.querySelector(".input");
                if (id && input) {
                    instance.input.id = "flatpickr_hidden_" + id;
                    input.id = id;
                }
            }
        }
    });

    if (options) {
        picker.altInput.disabled = utilities.coalesce(options.disabled, false);
        picker.altInput.readOnly = utilities.coalesce(options.readOnly, false);
        picker.altInput.placeholder = utilities.coalesce(options.placeholder, "");

        picker.altInput.addEventListener("blur", (e) => {
            const isInput = e.target === picker._input;

            // Workaround for: onchange does not fire when user writes the time and then click outside of the input area.
            if (isInput && picker.isOpen === false) {
                picker.input.dispatchEvent(utilities.createEvent("change"));
                picker.input.dispatchEvent(utilities.createEvent("input"));
            }
        });
    }

    _pickers[elementId] = picker;
}

export function destroy(element, elementId) {
    const instances = _pickers || {};

    const instance = instances[elementId];

    if (instance) {
        instance.destroy();
    }

    delete instances[elementId];
}

export function updateValue(element, elementId, value) {
    const picker = _pickers[elementId];

    if (picker) {
        picker.setDate(value);
    }
}

export function updateOptions(element, elementId, options) {
    const picker = _pickers[elementId];

    if (picker) {
        if (options.displayFormat.changed) {
            picker.set("altFormat", options.displayFormat.value);
        }

        if (options.timeAs24hr.changed) {
            picker.set("time_24hr", options.timeAs24hr.value);
        }

        if (options.min.changed) {
            picker.set("minTime", options.min.value);
        }

        if (options.max.changed) {
            picker.set("maxTime", options.max.value);
        }

        if (options.disabled.changed) {
            picker.altInput.disabled = options.disabled.value;
        }

        if (options.readOnly.changed) {
            picker.altInput.readOnly = options.readOnly.value;
            picker.set("clickOpens", !options.readOnly.value);
        }

        if (options.inline.changed) {
            picker.set("inline", utilities.coalesce(options.inline.value, false));
        }

        if (options.disableMobile.changed) {
            picker.set("disableMobile", utilities.coalesce(options.disableMobile.value, true));
        }

        if (options.placeholder.changed) {
            picker.altInput.placeholder = utilities.coalesce(options.placeholder.value, "");
        }

        if (options.staticPicker.changed) {
            picker.set("static", options.staticPicker.value);
        }

        if (options.hourIncrement.changed) {
            picker.set("hourIncrement", options.hourIncrement.value);

            if (picker.hourElement) {
                picker.hourElement.step = options.hourIncrement.value;
            }
        }

        if (options.minuteIncrement.changed) {
            picker.set("minuteIncrement", options.minuteIncrement.value);

            if (picker.minuteElement) {
                picker.minuteElement.step = options.minuteIncrement.value;
            }
        }
    }
}

export function open(element, elementId) {
    const picker = _pickers[elementId];

    if (picker) {
        picker.open();
    }
}

export function close(element, elementId) {
    const picker = _pickers[elementId];

    if (picker) {
        picker.close();
    }
}

export function toggle(element, elementId) {
    const picker = _pickers[elementId];

    if (picker) {
        picker.toggle();
    }
}

export function updateLocalization(element, elementId, localization) {
    const picker = _pickers[elementId];

    if (picker) {
        picker.config.locale = localization;

        if (picker.l10n) {
            picker.l10n.amPM = localization.amPM;
        }

        if (picker.amPM) {
            const selectedDate = picker.selectedDates && picker.selectedDates.length > 0 ? picker.selectedDates[0] : null;
            const index = selectedDate && selectedDate.getHours() >= 12 ? 1 : 0;

            picker.amPM.innerHtml = localization.amPM[index];
            picker.amPM.innerText = localization.amPM[index];
        }

        picker.redraw();
    }
}

export function focus(element, elementId, scrollToElement) {
    const picker = _pickers[elementId];

    if (picker && picker.altInput) {
        utilities.focus(picker.altInput, null, scrollToElement);
    }
}

export function select(element, elementId, focus) {
    const picker = _pickers[elementId];

    if (picker && picker.altInput) {
        utilities.select(picker.altInput, null, focus);
    }
}