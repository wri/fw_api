db.createUser({
  user: "admin",
  pwd: "password",
  roles: [
    {
      role: "readWrite",
      db: "fw_api_db"
    }
  ]
});
