const { pool } = require("../../config/database");

exports.deleteStudent = async function(connection, studentIdx){
  const Query =  `UPDATE Students set status='D' where studentIdx=?;`
  const Params = [studentIdx];

  const rows = await connection.query(Query, Params);

  return rows;
}

exports.updateStudent = async function(connection, studentIdx, studentName, major, birth, address){
  const Query = `update Students set studentName = ifnull(?, studentName), major = ifnull(?, major), birth = ifnull(?, birth), address = ifnull(?, address) where studentIdx = ?`;
  const Params = [studentName, major, birth, address, studentIdx];

  const rows = await connection.query(Query, Params);

  return rows;
}

exports.isValidStudentIdx = async function (connection, studentIdx) {
  const Query = `SELECT * FROM Students where studentIdx = ? and status = 'A';`;
  const Params = [studentIdx];

  const [rows] = await connection.query(Query, Params);

  if (rows < 1){
    return false;
  }
  return true;
};

exports.insertStudents = async function (connection, studentName, major, birth, address) {
  const Query = `insert into Students(studentName, major, birth, address) values(?,?,?,?);`;
  const Params = [studentName, major, birth, address];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.selectStudents = async function (connection, studentIdx) {
  const Query = `SELECT * FROM Enrolment.Students where studentIdx = ?;`;
  const Params = [studentIdx];


  const rows = await connection.query(Query, Params);

  return rows;
};

exports.exampleDao = async function (connection) {
  const Query = `SELECT * FROM Students;`;
  const Params = [];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.readRestaurants = async function(connection, category){
  const selectAllRestaurantsQuery = `SELECT title, address, category, url FROM restaurants where status = 'A';`;
  const selectRestaurantByCategoryQuery = `SELECT title, address, category, url FROM restaurants where status = 'A' and category = ?;`
  const Params = [category];

  const Query = category ? selectRestaurantByCategoryQuery : selectAllRestaurantsQuery
  const rows = await connection.query(Query, Params);

  return rows;
};

// exports.selectRestaurant = async function(connection, category){
//   const Query = `SELECT restaurantName, address, category, url FROM restaurants where status = 'A' and category = ?;`
//   const Params = [category];

//   const rows = await connection.query(Query, Params);

//   return rows;

// }
