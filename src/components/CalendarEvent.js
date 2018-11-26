// import moment from 'moment';

function CalendarEvent(
  title, start, end, requestor, approver,
) {
  this.title = title;
  this.start = start;
  this.end = end;
  this.requestor = requestor;
  this.approver = approver;
}
