import Constants from './common';

// CalendarEvent is a JSON representation of a calendar event
// {
//   title: string,
//   startDate: moment,
//   endDate: moment,
//   halfDay: string[AM|PM|''],
//   requestor: string[email],
//   firstApprover: string[email],
//   secondApprover: string[email],
//   firstStatus: int[PENDING|APPROVED|REJECTED],
//   secondStatus: int[PENDING|APPROVED|REJECTED],
//   leaveType: string[ANN, COMP, CARRY, SICK, BIRTH],
// }
export class CalendarEvent {
  constructor(title, start, end, half, req, fApprov, sApprov, fSt, sSt, fC, sC, id, lt) {
    this.title = title;
    this.startDate = start;
    this.endDate = end;
    this.halfDay = half;
    this.requestor = req;
    this.firstApprover = fApprov;
    this.secondApprover = sApprov;
    this.firstStatus = fSt;
    this.secondStatus = sSt;
    this.firstComment = fC;
    this.secondComment = sC;
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
      firstApprover: this.firstApprover,
      secondApprover: this.secondApprover,
      firstStatus: this.firstStatus,
      secondStatus: this.secondStatus,
      firstComment: this.firstComment,
      secondComment: this.secondComment,
      leaveType: this.leaveType,
    };
  }

  static fromJSON(j) {
    return new CalendarEvent(
      j.title,
      j.startDate,
      j.endDate,
      j.halfDay,
      j.requestor,
      j.firstApprover,
      j.secondApprover,
      j.firstStatus,
      j.secondStatus,
      j.firstComment,
      j.secondComment,
      null,
      j.leaveType,
    );
  }

  toCalendarEvent() {
    return {
      title: this.title,
      allDay: (this.halfDay === ''),
      start: this.startDate,
      end: this.endDate,
    };
  }

  /**
   * @returns {Constants.PENDING|APPROVED|REJECTED}
   */
  aggregateStatus() {
    // console.log('aggrStatus, ', this.toJSON());
    // if there is a 2nd approver, we need to figure overall status
    if (this.secondApprover !== '' && this.secondApprover !== undefined) {
      if (this.firstStatus === Constants.PENDING || this.secondStatus === Constants.PENDING) {
        return Constants.PENDING;
      } else if (this.firstStatus === Constants.REJECTED
          || this.secondStatus === Constants.REJECTED) {
        return Constants.REJECTED;
      } else if (this.firstStatus === Constants.APPROVED
          && this.secondStatus === Constants.APPROVED) {
        return Constants.APPROVED;
      }
    } else {
      // otherwise, just use the firstStatus
      return this.firstStatus;
    }

    // we shouldn't ever reach this but will return as default
    console.log('WARNING!! CalendarEvent.aggregateStatus, ', this);
    return this.firstStatus;
  }

  /**
   * Determine if this user can still approve/reject
   * Reasons considered include:
   *  - not listed as first/second approver
   *  - already approved/rejected
   * @param {email} string
   * @returns {boolean}
   */
  canApproveOrReject(email) {
    // console.log('canapproveorreject, ', this.aggregateStatus());
    if (this.aggregateStatus() !== Constants.PENDING) return false;

    if (email === this.firstApprover) {
      if (this.firstStatus !== Constants.PENDING) return false;
    } else if (email === this.secondApprover) {
      if (this.secondStatus !== Constants.PENDING) return false;
    } else {
      return false;
    }

    return true;
  }
}
