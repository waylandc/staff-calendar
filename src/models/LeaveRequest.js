export class LeaveRequest {
  constructor({ title = '', startDate = null, endDate = null, status = 0, requestor = '', approver = '', halfDay = false } = {}) {
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.requestor = requestor;
    this.approver = approver;
    this.halfDay = halfDay;
  }
}

export function createLeaveRequest(data) {
  return new LeaveRequest(data);
}
