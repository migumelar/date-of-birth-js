import { h, text } from 'superfine'
import { storeValue } from './action'

// wrapper for whole components
function datepickerUI(app) {
    return h('div', {
        "class": `dob-datepicker__wrapper ${app.state.show_datepicker ? '' : 'dob-datepicker__wrapper--hide'} `
    },
        [
            h('div', {
                "class": `dob-datepicker__background ${app.options.display_mode === 'popup' ? 'dob-datepicker__background--popup' : ''}`,
                "style": `z-index: ${app.options.zIndex.invisibleBackground}`,
                onclick: () => {
                    app.hideDatepicker()
                }
            }),
            h("div", {
                "id": `datepicker-widget__${app.instance_id}`,
                "class": `dob-datepicker ${app.options.display_mode === 'popup' ? 'dob-datepicker--popup' : ''}`,
                "style": `z-index: ${app.options.zIndex.datepickerWidget}`
            },
                [
                    topArrow(app), // top arrow little thingy component
                    header(app), // show header component, default: "when is your birthday?"
                    app.state.show_alerts ? alerts(app) : h("div", {}),
                    selectionHeader(app), // show selection labels, like "Select day", "Select month", "Select year"
                    h("div", { "class": "dob-datepicker__options" }, //wrapper for options
                        getCurrenPageSelection(app) //show option component depend on what page currently is
                    ),
                    app.state.current_page > 0 ? resetButton(app) : h("div", {}) // restart button, hidden when on the first page (current_page = 0)
                ]
            )
        ])

}

function topArrow(app) {
    return h('div', {
        "class": `top-arrow ${app.options.display_mode === 'popup' ? 'top-arrow--popup' : ''}`
    })
}

// get current page options component, this is just a helper function so `datepickerUI` function is not cluttered
// if page 0, then show month component,
// if page 1, then show day component,
// if page 2, then show year component
function getCurrenPageSelection(app) {
    if (app.state.current_page === 0) {
        return monthSelection(app)
    } else if (app.state.current_page === 1) {
        return daySelection(app)
    } else {
        return yearSelection(app)
    }
}

// alert message component, like "Date is invalid"
function alerts(app) {
    return h("div", { "class": "dob-datepicker__alert" },
        text(app.options.alerts[app.state.show_alerts])
    )
}

// header component, default: "when is your birthday?"
function header(app) {
    return h("div", { "class": "dob-datepicker__header" },
        text(app.options.labels.header_label)
    )
}

// selection labels, like "Select day", "Select month", "Select year"
function selectionHeader(app) {
    return h("div", { "class": "dob-datepicker__selection-header" }, getSelectionHeaderLabel(app))
}

// get label of current page, this is just a helper function so `selectionHeader` function is not cluttered
function getSelectionHeaderLabel(app) {
    if (app.state.current_page === 0) {
        return text(app.options.labels.select_month_label)
    } else if (app.state.current_page === 1) {
        return text(app.options.labels.select_day_label)
    } else {
        return text(app.options.labels.select_year_label)
    }
}

// reset and try again button component
function resetButton(app) {
    return h("button", { "class": "dob-datepicker__reset" },
        [
            h("div", {
                "class": "dob-datepicker__reset-text",
                "onclick": () => {
                    app.resetProcess()
                }
            },
                text(app.options.labels.reset_button_label)
            )
        ]
    )
}

// month selection component
function monthSelection(app) {
    return h("div", { "class": "dob-datepicker__month", tabindex: "0" },
        app.options[app.options.show_long_month ? 'long_month' : 'short_month'].map((month, index) => {
            return h("button", {
                "key": index + 1,
                "value": index + 1,
                "class": "dob-datepicker__month__button",
                onclick: function () {
                    storeValue('month', index + 1, app)
                    app.renderDatepicker()
                }
            },
                text(month)
            )
        })
    )
}

// day selection component
function daySelection(app) {
    return h("div", { "class": "dob-datepicker__day", tabindex: "0" },

        [...Array(app.state.dob.month === 2 ? 30 : 32).keys()].map((day, index) => {
            // console.log(index + 1)
            return day === 0 ? null : h("button", {
                "key": index,
                "value": index,
                "class": "dob-datepicker__day__button",
                "onclick": () => {
                    storeValue('day', index, app)
                    app.renderDatepicker()
                }
            }, [
                text(day),
                app.options.enable_ordinal_number ? h('sup', { "class": "dob-datepicker__day__ordinal-number" }, getOrdinalSufix(index)) : null
            ])
        })

    )
}

function getOrdinalSufix(number) {
    const ordinals = ['th', 'st', 'nd', 'rd'];
    if ([1, 2, 3].includes(number % 10) && ![11, 12, 13].includes(number)) {
        return text(ordinals[number % 10]);
    } else {
        return text('th');
    }
}

// year selection wrapper component
function yearSelection(app) {

    return h('div', { "class": "dob-datepicker__year", tabindex: "0" }, generateYear(app))
}

// year section component. each section consist of 20 years, like from year 2020 - 2001
function yearSection(app, children, earliest_year, oldest_year) {

    return h('div', { "class": "dob-datepicker__year__year-section" }, [
        h("div", { "class": "dob-datepicker__year__year-section-header" }, text(`${app.options.labels.date_range_label}${oldest_year} - ${earliest_year}`)),
        h("div", { "class": "dob-datepicker__year__wrapper" }, children),
        h('div', { "class": "dob-datepicker__year__year-section-next" }, text('⌄'))
    ])
}

// generate the year
function generateYear(app) {

    // get current year
    let current_year = new Date().getFullYear()

    // variable container for all years
    let all_years = []

    // variable container for year section, each section consist of 20 years (or less if the year number is not even)
    let year_section = []

    // year list like [2020, 2019, 2018...], I need this to track oldest and earliest year for each year section, e.g: 'Year 2020 - 2001`
    let year_range = []


    // loop from current year until olders year
    for (let i = current_year; i >= (current_year - app.options.year_range); i--) {

        // process the per batch, each batch consist of 20 years
        if (year_section.length < 20) {

            // store the year to year list to retrieve later
            year_range.push(i)

            // craete element of each BUTTON then store it to year section container
            year_section.push(
                h('button', {
                    "key": i, "value": i, "class": "dob-datepicker__year__button", onclick: () => {
                        storeValue('year', i, app)
                        app.renderDatepicker()
                    }
                }, [
                    h('span', { "class": "dob-datepicker__year__button__first" }, text(i.toString().substring(0, 2))),
                    h('span', { "class": "dob-datepicker__year__button__last" }, text(i.toString().substring(2)))
                ])
            )

            // if the year section is full (20 years), then wrap the BUTTONS with year section element (year 2020 - 2001, down arrow and averyhting else )
            if (year_section.length === 20) {

                // after we wrap the button with section element. we store it to All years variable
                all_years.push(yearSection(app, year_section, year_range[0], year_range[year_range.length - 1]))

                // after we store it to year container, empty this variable to start the next batc
                year_section = []
                year_range = []
            }

            // in the last batch, it quite likely that the number of left over year is less than 20
            // if current loop item is equal to oldest year, then wrap it on year section and push it to All years container
            if (i === (current_year - app.options.year_range)) {
                all_years.push(yearSection(app, year_section, year_range[0], year_range[year_range.length - 1]))
            }

        }
    }

    // return all years to parent component
    return all_years
}





export default datepickerUI
