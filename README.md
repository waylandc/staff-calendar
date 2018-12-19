# Calendar App to track Leave of Absence for staff

> Vue PWA app using vuejs, vuetify, google MD, axios, vuex, Google Firebase/Firestore

This application is intended to allow our staff to book a leave of absence and for managers to approve/reject.

### Types of leave supported
* Annual Leave
* Carried Over (must be used up before March 31 or it will be forfeited as per the Employee Handbook)
* Compensation Leave
* Sick Leave

### User Roles
* Normal user
	* view/book leave
* Approver
	* Approve and Reject leave requests
* Administrator
	* Edit user entitled leave
	* maintain holiday calendar
	* Reset passwords

<i>*To delete users, you must contact Database Admin</i>

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
