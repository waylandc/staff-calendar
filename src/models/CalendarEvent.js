export class CalendarEvent {
  constructor(title, start, end, half, requestor, approver, status, id) {
    this.title = title;
    this.start = start;
    this.end = end;
    this.halfDay = half;
    this.requestor = requestor;
    this.approver = approver;
    this.status = status;
    this.docId = id;
  }

  toJSON() {
    return {
      title: this.title,
      start: this.start,
      end: this.end,
      halfDay: this.halfDay,
      requestor: this.requestor,
      approver: this.approver,
      status: this.status,
      docId: this.docId,
    };
  }
}

