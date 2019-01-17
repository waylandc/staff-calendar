// We use Firebase for user authentication but we need
// to store additional fields for our app. This is why you'll
// notice we don't store password b/c firebase takes care of auth
export class User {
  // new User(...)
  constructor(email, admin, approver, al, db, co, cl, s, bl, id, fn, ln, dob, c) {
    this.email = email;
    this.isAdmin = admin;
    this.isApprover = approver;
    this.daysAnnualLeave = al;
    this.daysBooked = db;
    this.daysCarryOver = co;
    this.daysCompLeave = cl;
    this.daysSick = s;
    this.daysBirthdayLeave = bl;
    this.docId = id; // docId is the document id in firebase
    this.firstName = fn;
    this.lastName = ln;
    this.dob = dob;
    this.comments = c;  // {date: d, changedBy: email, comment: string}
  }

  // this is used for createing the JSOn object we store in firestore
  // note I don't put comments in here because firestore has crummy support
  // for nested collections (i.e. array within the custom object)
  // so I had to create a new FS collection called userComments and store it
  // separately in the API layer
  toJSON() {
    console.log('toJSON');
    return {
      email: this.email,
      isAdmin: this.isAdmin,
      isApprover: this.isApprover,
      daysAnnualLeave: this.daysAnnualLeave,
      daysBooked: this.daysBooked,
      daysCarryOver: this.daysCarryOver,
      daysCompLeave: this.daysCompLeave,
      daysSick: this.daysSick,
      daysBirthdayLeave: this.daysBirthdayLeave,
      docId: this.docId,
      firstName: this.firstName,
      lastName: this.lastName,
      dob: this.dob,
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
    d.daysBirthdayLeave,
    d.docId,
    d.firstName,
    d.lastName,
    d.dob,
    d.comments,
  );
}
