// CalendarEvent is a JSON representation of a calendar event
// {
//   title: string,
//   startDate: moment,
//   endDate: moment,
//   halfDay: string[AM|PM|''],
//   requestor: string[email],
//   approver: string[email],
//   status: int[PENDING|APPROVED|REJECTED],
//   leaveType: string[ANN, COMP, CARRY],
// }
export class CalendarEvent {
  constructor(title, start, end, half, requestor, approver, status, id, lt) {
    this.title = title;
    this.startDate = start;
    this.endDate = end;
    this.halfDay = half;
    this.requestor = requestor;
    this.approver = approver;
    this.status = status;
    this.docId = id;
    this.leaveType = lt;
  }

  toJSON() {
    return {
      title: this.title,
      startDate: this.startDate,
      endDate: this.endDate,
      halfDay: this.halfDay,
      requestor: this.requestor,
      approver: this.approver,
      status: this.status,
      leaveType: this.leaveType,
    };
  }

  toCalendarEvent() {
    return {
      title: this.title,
      allDay: (this.halfDay === ''),
      start: this.startDate,
      end: this.endDate,
    };
  }
}

