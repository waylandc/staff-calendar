export class User {
  constructor(email, admin, approver, al, cl, co, db) {
    this.email = email;
    this.isAdmin = admin;
    this.isApprover = approver;
    this.daysAnnualLeave = al;
    this.daysBooked = db;
    this.daysCarryOver = co;
    this.daysCompLeave = cl;
  }

  toJSON() {
    return {
      email: this.email,
      isAdmin: this.isAdmin,
      isApprover: this.isApprover,
      daysAnnualLeave: this.daysAnnualLeave,
      daysBooked: this.daysBooked,
      daysCarryOver: this.daysCarryOver,
      daysCompLeave: this.daysCompLeave,
    };
  }
}

export function createUser(data) {
  return new User(data);
}
