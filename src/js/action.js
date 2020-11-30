const validateDate = require("validate-date");
                                                                                                 
// convert date and day from 1 to 01, 2 to 02, etc
function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

// clear alert by setting the show_alerts state to null
function clearAlert(app) {
    app.state.show_alerts = null
}

function processInput(app) {

    // move to next page
    moveToNextPage(app)

    // clear any previous alert
    clearAlert(app)

    // do default function validation if opted-in
    defaultValidation(app)

    // assign value to target node's value attribute
    assignDateToTargetNode(app)

}

// move to next page
function moveToNextPage(app) {
    app.state.current_page = app.state.current_page + 1
}

// format date from State to YYYY-MM-DD format
function getDefaultDateFormat(app) {
    return `${app.state.dob.year}-${pad(app.state.dob.month)}-${pad(app.state.dob.day)}`
}

// show alert and reset the process (return to first page and clear state)
function showAlert(app, alert_type) {
    app.state.show_alerts = alert_type
    app.resetProcess()
}

// assign value to target node's value attribute
function assignDateToTargetNode(app) {

    // if not in the last page then skip this function
    if ((app.state.current_page !== 3) || (app.state.show_alerts !== null)) {
        return app
    }

    // if user provide custom date formatter, use their function
    const selected_date = app.options.dateFormat ? app.options.dateFormat(getDefaultDateFormat(app)) : getDefaultDateFormat(app);

    // store selected date state
    app.state.selected_date = selected_date
    app.datepickerTargetNode.value = selected_date

    // close the datepicker
    app.hideDatepicker()

}

// do the fault validation to make sure date is exist
function defaultValidation(app) {

    // if not in the last page then skip this function
    if (app.state.current_page !== 3) {
        return;
    }

    // if built in validation is not enabled, skip this function
    if (!app.options.enable_built_in_validation) {
        return;
    }

    // if the date is not exist or selected date is > date now then set the the alert
    if (
        (!validateDate(getDefaultDateFormat(app), "boolean", "yyyy-mm-dd")) ||
        (new Date(getDefaultDateFormat(app)) > new Date())
    ) {
        showAlert(app, 'invalid_date_alert')
    }

    return app
}


// store value to state
function storeValue(type, value, app) {

    // store selected day/month/year to state
    app.state.dob[type] = value

    // proceed to move to the next page or assign date to target node
    processInput(app)

}


export { storeValue }