process.env.NODE_ENV = "test"

const request = require("supertest");

const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {

  it("should generate a proper partial update query with just 1 field",
      function () {
    let table = "tables";
    let items = { key: "b", key2: "a" };
    let key = "id";
    let id = 1;
    
    const { query, values } = sqlForPartialUpdate(table, items, key, id);

    // FIXME: write real tests!
    // expect(false).toEqual(true);
    // expect(sqlForPartialUpdate(table, items, key, id)).toEqual({ query: `UPDATE tables SET key=$1, key2=$2 WHERE key=$3 RETURNING *`, values: ['b', 'a', '1'] })
    expect(query).toEqual(`UPDATE tables SET key=$1, key2=$2 WHERE id=$3 RETURNING *`);
    expect(values).toEqual(['b', 'a', 1]);
  });
});
