export class User {
  constructor(email, pass, admin, approver, al, cl, co, db) {
    this.email = email;
    this.isAdmin = admin;
    this.isApprover = approver;
    this.password = pass;
    this.daysAnnualLeave = al;
    this.daysBooked = db;
    this.daysCarryOver = co;
    this.daysCompLeave = cl;
  }

  toJSON() {
    return {
      email: this.email,
      password: this.password,
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
