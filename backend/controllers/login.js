const {pool} =require("../models/db")
const bcrypt =require("bcrypt")
const jwt =require("jsonwebtoken")

const login =(req,res)=>{
 const password =req.body.password;
 const email=req.body.email;
 const values =[email.toLowerCase()];
 const query=`SELECT * FROM users WHERE email = $1` ; 
 pool
 .query(query, values)
 .then((result) => {
   if (result.rows.length) {
     bcrypt.compare(password, result.rows[0].password, (err, response) => {
       if (err) res.json(err);
       if (response) {
         const payload = {
           userId: result.rows[0].id,
           country: result.rows[0].country,
           role: result.rows[0].role_id,
         };
         const options = { expiresIn: "1d" };
         const secret = process.env.SECRET;
         const token = jwt.sign(payload, secret, options);
         if (token) {
           return res.status(200).json({ token, userId: result.rows[0].id });
         } else {
           throw Error;
         }
       } else {
         res.status(403).json({
           success: false,
           message: `The password you’ve entered is incorrect`,
         });
       }
     });
   } else throw Error;
 })
 .catch((err) => {
   res
     .status(404)
     .json({ success: false, message: "The email doesn't exist", err });
 }); 
}
const updateUserById=(req,res)=>{
const id=req.params.id;
const {firstName,lastName,age,country}=req.body
const values =[firstName||null,lastName||null,age||null,country||null,id];
const query=`UPDARE users SET firstName=COALESCE($1,firstname),lastName=COALESCE($2,lastName),age=COALESCE($3,age),country=COALESCE($4,country) WHERE id=$5 AND is_deleted=0  RETURNING *;`
pool
.query(query, values)
.then((result) => {
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      massage: `The user: ${id} is not found`,
    });
  } else {
    res.status(200).json({
      success: true,
      massage: `Succeeded to updated user with id: ${id}`,
      result: result.rows[0],
    });
  }
})
.catch((err) => {
  res.status(500).json({
    success: false,
    massage: "Server Error",
    err: err,
  });
});

}
const deleteUserById =(req,res)=>{
  const id = req.params.id;
  const query = `UPDATE users SET is_deleted=1 WHERE id=$1;`;
  const values = [id];
  pool
  .query(query, values)
  .then((result) => {
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        massage: `The user: ${id} is not found`,
        err: err,
      });
    } else {
      res.status(200).json({
        success: true,
        massage: `Succeeded to delete user with id: ${id}`,
      });
    }
  })
  .catch((err) => {
    res.status(500).json({
      success: false,
      massage: "Server Error",
      err: err,
    });
  });
}
const getAllUsers=(req,res)=>{
  const query = `SELECT * FROM users  WHERE is_deleted=0 ORDER BY 1;`;
  pool
    .query(query)
    .then((result) => {
      res.status(200).json({
        success: true,
        massage: "All the users",
        result: result.rows,
        userId: req.token.userId,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        massage: "server error",
        err: err,
      });
    });
}

module.exports={login,updateUserById,deleteUserById,getAllUsers}