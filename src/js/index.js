import { patch } from 'superfine'
import datepickerUI from './app.js'
import { createFocusTrap } from 'focus-trap';

// instance ID counter
let instance_id = 0

// default configurations
const DEFAULT_OPTIONS = {
    display_mode: 'inline',
    year_range: 120,
    enable_built_in_validation: true,
    enable_ordinal_number: true,
    show_long_month: true,
    dateFormat: null,
    zIndex: {
        targetNode: "150",
        datepickerWidget: "150",
        invisibleBackground: "100"
    },
    long_month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short_month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    labels: {
        header_label: 'When is your birthday?',
        select_day_label: 'Select day',
        select_month_label: 'Select month',
        select_year_label: 'Select year',
        reset_button_label: 'Reset and try again',
        date_range_label: 'Year ' //label for year section -> "Year 2000 - 2020"
    },
    alerts: {
        invalid_date_alert: 'Date is invalid'
    }
}

// function factory of datepicker
function dobDatepicker() {

    const datepickerPrototype = Object.create(datepickerMethods)

    const datepickerData = {
        instance_id: instance_id++,
        state: {
            selected_date: null,
            show_datepicker: false,
            show_alerts: null,
            current_page: 0, // page 0 is select month page, page 1 is select day page, page 2 is select year page
            dob: {
                day: null,
                month: null,
                year: null
            },
        },
        options: { ...DEFAULT_OPTIONS },
        selector: null,
        datepickerWidgetNode: null,
        datepickerContainerNode: null,
        datepickerTargetNode: null,
        datepickerTargetParentNode: null,
        focusTrap: null
    }


    return Object.assign(datepickerPrototype, datepickerData)
}


// datepicker methods prototype
const datepickerMethods = {
    getDatepickerWidgetNode: function () {

        return this.datepickerWidgetNode ? this.datepickerWidgetNode : this.setDatepickerWidgetNode()
    },
    setDatepickerWidgetNode: function () {

        return this.datepickerWidgetNode = document.getElementById(`datepicker-widget__${this.instance_id}`);
    },
    getDatepickerTargetNode: function () {

        return this.datepickerTargetNode ? this.datepickerTargetNode : this.setDatepickerTargetNode()
    },
    setDatepickerTargetNode: function () {

        return this.datepickerTargetNode = (this.selector instanceof Element) ? this.selector : document.querySelector(this.getSelector())
    },
    getDatepickerTargetParentNode: function () {

        return this.datepickerTargetParentNode ? this.datepickerTargetParentNode : this.setDatepickerTargetParentNode()
    },
    setDatepickerTargetParentNode: function () {

        return this.datepickerTargetParentNode = document.querySelector(this.getSelector()).parentElement;
    },
    getdatepickerContainerNode: function () {

        return this.datepickerContainerNode ? this.datepickerContainerNode : this.setDatepickerContainerNode()
    },
    setDatepickerContainerNode: function () {

        const container = document.createElement('div')
        container.style.setProperty('position', 'absolute')

        return this.datepickerContainerNode = container
    },
    getSelector: function () {

        return this.selector
    },
    setSelector: function (selector) {

        this.selector = selector

        return this
    },
    getFocusTrap: function () {

        return this.focusTrap ? this.focusTrap : this.setFocusTrap()
    },
    setFocusTrap: function () {
        return this.focusTrap = createFocusTrap(this.getDatepickerWidgetNode(), {
            clickOutsideDeactivates: true,
            returnFocusOnDeactivate: false
        });
    },
    registerUserOptions: function (user_options) {

        // replace default options with user's options
        Object.assign(this.options, user_options)

        return this
    },
    resetProcess: function () {
        this.state.dob.day = null
        this.state.dob.month = null
        this.state.dob.year = null
        this.state.current_page = 0
        this.renderDatepicker(this)

        return this
    },
    showDatepicker: function () {

        this.state.show_datepicker = true
        this.resetProcess()

        return this
    },
    hideDatepicker: function () {

        this.state.show_datepicker = false
        this.renderDatepicker(this)

        return this
    },
    attachListenerToTargetNode: function () {

        // when cursor focus on datepicker then show the datepicker
        this.getDatepickerTargetNode().addEventListener("focus", () => {
            this.showDatepicker()
        })

        // when user press escape then hide the datepicker
        document.addEventListener("keydown", (e) => {
            if (e.key === 'Escape') {
                this.hideDatepicker()
            }
        })

        return this
    },
    attachDatepickerContainerToDOM: function () {

        // set parent of target element (target element is element with the selector/DOM provided by user) `style = relative` 
        // because the datepicker container need to have `absolute` positioning
        // then append the datepicker container as the child
        const container = this.getdatepickerContainerNode()
        this.getDatepickerTargetParentNode().style.setProperty('position', 'relative')
        this.getDatepickerTargetParentNode().appendChild(container);

        return this
    },
    adjustDatepickerPosition: function () {

        const widgetRect = this.getDatepickerWidgetNode().getBoundingClientRect()
        const parentRect = this.getDatepickerTargetParentNode().getBoundingClientRect()
        const targetRect = this.getDatepickerTargetNode().getBoundingClientRect()

        const top = parentRect.height - (parentRect.bottom - targetRect.bottom)
        const left = (targetRect.left - parentRect.left) + ((targetRect.width / 2) - (widgetRect.width / 2))

        // +12px is height of the arrow
        this.getdatepickerContainerNode().style.top = `${top + 12}px`;
        this.getdatepickerContainerNode().style.left = `${left}px`;

        return this
    },
    renderDatepicker: function () {

        // deactivate focus trap before rendering anything, **Only one focus trap can be listening at a time** 
        this.getFocusTrap().deactivate()

        // render the UI
        patch(this.getdatepickerContainerNode(), datepickerUI(this))

        // adjust position
        this.adjustDatepickerPosition()

        // if datepicker is shown then activate the focus trap
        if (this.state.show_datepicker) {
            this.getFocusTrap().activate()
        }

        return this
    },
    init: function (selector, options) {

        this
            .setSelector(selector)
            .registerUserOptions(options)
            .attachDatepickerContainerToDOM()
            .renderDatepicker()
            .attachListenerToTargetNode()
            .adjustDatepickerPosition()
            .setFocusTrap()

    }
}


// expose funtion to global variable so the method is usable directly from browser
window.dobDatepicker = dobDatepicker

export default dobDatepicker