// We use Firebase for user authentication but we need
// to store additional fields for our app. This is why you'll
// notice we don't store password b/c firebase takes care of auth
export class User {
  // new User(...)
  constructor(email, admin, approver, al, cl, co, db, s, id, fn, ln) {
    this.email = email;
    this.isAdmin = admin;
    this.isApprover = approver;
    this.daysAnnualLeave = al;
    this.daysBooked = db;
    this.daysCarryOver = co;
    this.daysCompLeave = cl;
    this.daysSick = s;
    this.docId = id; // docId is the document id in firebase
    this.firstName = fn;
    this.lastName = ln;
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
      daysSick: this.daysSick,
      docId: this.docId,
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }
}

// createUser({email: e, ...})
export function createUserModel(d) {
  return new User(
    d.email,
    d.isAdmin,
    d.isApprover,
    d.daysAnnualLeave,
    d.daysBooked,
    d.daysCarryOver,
    d.daysCompLeave,
    d.daysSick,
    d.docId,
    d.firstName,
    d.lastName,
  );
}
