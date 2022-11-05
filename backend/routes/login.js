const express = require("express");
const { login, updateUserById, deleteUserById, getAllUsers } = require("../controllers/login");

const loginRouter = express.Router();

loginRouter.post("/",login);
loginRouter.get("/",getAllUsers);
loginRouter.put("/:id",updateUserById);
loginRouter.delete("/:id",deleteUserById);

module.exports = loginRouter;

////aa
