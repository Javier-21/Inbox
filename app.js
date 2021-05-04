const path = require("path");
//defining the model
/**
 * Mail constructor.
 * @param fromId The sender id of the mail. Needs to be an existing user.
 * @param toId The receiver id of the mail. Needs to be an existing user.
 * @param body The body of the mail.
 * @param timestamp The mail creation timestamp.
 */
function Mail(from, to, subject, body){
  this.id = ++Mail.idCounter;
  this.from = from;
  this.to = to;
  this.subject = subject;
  this.body = body;
  this.timestamp = Date.now();

}

Mail.idCounter = 0;

/**
 * Static database with all the inbox users. It is a dictionary indexed by
 * the user ID.
 */
let userDB = {
  'pep@mydomain.com': '123',
  'mar@mydomain.com': '123',
  'nil@mydomain.com': '123'
}

let mailServer = {
  users: userDB,
  //dictionary indexed by userId. For each userId it contains the user's inbox.
  inboxes: {},

  /**
   * Adds a new mail to the inbox of the mailAddress in the mail.to field.
   * @param The mail to be added
   */
  addMail: function(mail){
    let mailAddress = mail.to;
    this.inboxes[mailAddress] = this.inboxes[mailAddress] || {}
    this.inboxes[mailAddress][mail.id]=mail;
  },

  /**
   * Deletes the mail with id: mailId from inbox of the user with mailAddress.
   * @param mailAddress the mail address of a user.
   * @param mailId the id of the mail to be deleted.
   */
  deleteMail: function(mailAddress, mailId){
    delete this.inboxes[mailAddress][mailId];
  },

 /**
  * Returns the inbox (the dictionary) indexed by mailAddress.
  * @param mailAddres the user mail address.
  */
  getInbox: function(mailAddress){
    return this.inboxes[mailAddress];
  },

  /**
   * Returns an array with all the mailAddress handled by the mail server.
   * example: ['pep@mydomain.com', 'mar@mydomain.com', 'nil@mydomain.com': '123']
   */
  getAddressBook: function(){
    let i = 0;
    let addressBook = [];
    for(let mailAddress in this.users){
      addressBook.push(mailAddress);
    }
    return addressBook;
  },
}


//dummy mailServer
mailServer.addMail(new Mail('pep@mydomain.com','mar@mydomain.com','Hi Mar', 'This is a test from pep to mar'));
mailServer.addMail(new Mail('pep@mydomain.com','nil@mydomain.com','Hi Nil', 'This is a test from pep to nil'));
mailServer.addMail(new Mail('mar@mydomain.com','pep@mydomain.com','Morning Pep', 'This is a test from mar to pep'));
mailServer.addMail(new Mail('mar@mydomain.com','nil@mydomain.com','Morning Nil', 'This is a test from mar to nil'));
mailServer.addMail(new Mail('nil@mydomain.com','pep@mydomain.com','By Pep', 'This is a test from nil to pep'));
mailServer.addMail(new Mail('nil@mydomain.com','mar@mydomain.com','By Mar', 'This is a test from nil to mar'));

const express = require('express')
const session = require('express-session')
const app = express()
const port = 3000

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true}));

app.use((req, res, next) => {
  if(!req.session.account){
    if(req.path == '/login') {
      console.log("applying next for login");
      next();
    }else if(req.path == '/'){
      console.log("redirecting to login.html");
      res.redirect('/login.html');
    }else{
      console.log("Illegal access");
      res.status(500).end('Operation not permitted');
    }
  }else {
    next();
  }
})

app.post("/login", (req, res) => {
  let account = req.body.account;
  let password = req.body.password;
  if(userDB[account] !== undefined && password == userDB[account]){
    req.session.account = account;
    res.redirect('/');
  }else{
    let accountDoesNotExist = 1;
    let passwdIncorrect = 2;
    let errCode = (userDB[account] === undefined ? accountDoesNotExist : passwdIncorrect);
    res.redirect(`/login.html?error=${errCode}`);
  }
});

//Begin routing
app.get("/", (req,res)=> {
  res.sendFile(path.join(__dirname,"index.html"));
});

app.get("/inbox", (req,res)=> {
  res.json(mailServer.getInbox(req.session.account));
  res.end();
});

app.post('/composedMail', (req,res)=> {
  mailServer.addMail(new Mail(req.session.account,req.body.to,req.body.subject, req.body.body));
  res.status(200).end();
});

app.get("/addressBook", (req,res)=> {
  res.json(mailServer.getAddressBook());
  res.end();
});

app.delete('/deleteMail/:mailId', (req,res) => {
  mailServer.deleteMail(req.session.account,req.params.mailId);
  res.status(200).end();
});

//creating an HTTP server.
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
