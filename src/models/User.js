// We use Firebase for user authentication but we need
// to store additional fields for our app
export class User {
  // new User(...)
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

// createUser({email: e, ...})
export function createUserModel(d) {
  return new User(d.email, d.isAdmin, d.isApprover, d.daysAnnualLeave,
    d.daysBooked, d.daysCarryOver, d.daysCompLeave);
}
