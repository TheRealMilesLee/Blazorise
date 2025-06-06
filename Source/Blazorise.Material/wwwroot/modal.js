import { addClassToBody, removeClassFromBody } from "../Blazorise/utilities.js?v=1.7.7.0";

export function open(element, scrollToTop) {
    addClassToBody("modal-open");

    if (scrollToTop) {
        const modalBody = element.querySelector('.modal-body');

        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }
}

export function close(element) {
    removeClassFromBody("modal-open");
}