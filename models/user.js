const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class User {
    static async all() {
        let users = await db.query(
            `SELECT username, first_name, last_name, email
            FROM users`
        );
        return users.rows;
    }

    static async create(username, password, first_name, last_name, email, photo_url, is_admin) {
        let user = await db.query(
            `INSERT INTO users (
                username, 
                password, 
                first_name, 
                last_name, 
                email, 
                photo_url, 
                is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                username,  
                first_name, 
                last_name, 
                email, 
                photo_url, 
                is_admin`,
            [username, password, first_name, last_name, email, photo_url, is_admin]
        );

        return user.rows[0];
    }

    static async get(username) {
        let user = await db.query(
          `SELECT username,  
          first_name, 
          last_name, 
          email, 
          photo_url
          FROM users
          WHERE username=$1`,
          [username]);
        return user.rows[0];
    }

    static async patch(username, first_name, last_name, email, photo_url) {
        let items = {
            first_name, last_name, email, photo_url
        }
        let { query, values } = sqlForPartialUpdate('users', items, 'username', username)
        let user = await db.query(query, values);
        return user.rows[0];
    }

    static async delete(username) {
        let user = await db.query(
            `DELETE FROM users
            WHERE username=$1`,
            [username]);
    }
}

module.exports = User;