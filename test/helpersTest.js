const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user.id === expectedUserID, "User has a valid email");

    it("should return undefined if not a valid email", function () {
      const user = getUserByEmail("user@example.com", testUsers);
      const expectedUserID = "userRandomID";
      assert(user.id !== expectedUserID, "undefined");
    });
  });
});
