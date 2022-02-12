//
//Node test nodemon start
console.log("Node is good to go");
//logging help
console.log(`"\u001b[1;35m <---------------------------->" `);
console.log(`"\u001b[1;42m" ${Date().toString()} "\u001b[0m"`);

//
//Sequelize Setup can be module
//
//Reading the sequelize mod in node mods executing it and returning the object constructor function
const Sequelize = require("sequelize");
//New Sequelize instance named sequelize with some parameters
const sequelize = new Sequelize(
  //('postgres://user:pass@example.com:5432/dbname')
  process.env.DATABASE_URL || "postgres://ericrodgers@localhost/ericrodgers"
);
//connection test
const test = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize Connection has been established successfully.");
  } catch (error) {
    console.error("Sequelize Unable to connect to the database:", error);
  }
};
test();
//

//
//Express setup
//
//Return express object
const express = require("express");
const req = require("express/lib/request");
//No need for new it is a factoy function
const app = express();
const PORT = 4567;
//

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});

//
//Relations
//
//Bookmark is a table it throws an s on it :)
const Bookmark = sequelize.define("bookmark", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { notEmpty: { args: true, msg: "This category is empty" } },
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { args: true, msg: "This category is empty" },
    },
  },
});

const go = async () => {
  try {
    await sequelize.sync({ force: true });
    await Bookmark.create({ name: "amazon.com", category: "shopping" });
    await Bookmark.create({ name: "Fullstack.com", category: "Sequelize" });
    await Bookmark.create({ name: "amazon.com", category: "karate" });
    await Bookmark.create({ name: "Neiman.com", category: "shopping" });
    await Bookmark.create({ name: "amazon.com", category: "karate" });
    await Bookmark.create({ name: "Fullstack.com", category: "node" });
    await Bookmark.create({ name: "amazon.com", category: "karate" });
    await Bookmark.create({ name: "meta.com", category: "node" });
    await Bookmark.create({ name: "amazon.com", category: "karate" });
    await Bookmark.create({ name: "Neiman.com", category: "karate" });
    await Bookmark.create({ name: "Meta.com", category: "karate" });
    await Bookmark.create({ name: "Meta.com", category: "Sequelize" });
    await Bookmark.create({ name: "Google.com", category: "Sequelize" });
  } catch (error) {
    console.log(error);
  }
};
app.use((req, res, next) => {
  if (req.method === "POST" && req.query._method) {
    req.method = req.query._method;
  }
  next();
});
app.use(express.urlencoded({ extended: false }));

// app.post("/post"(req, res, next)=> {
//     <form method="POST" action="/bookmarks/${bookmark.id}?_method=delete">
//                     <button>X</button>
//         </form>
// })

app.get("/", (req, res) => {
  res.redirect("/bookmarks");
});
app.delete("/bookmarks/:id", async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findByPk(req.params.id);
    await bookmark.destroy();
    res.redirect(`/categories/${bookmark.category}`);
  } catch (error) {
    next(error);
  }
});
app.get("/bookmarks", async (req, res, next) => {
  // Find all bookmarks
  try {
    const bookmarks = await Bookmark.findAll();
    const html = bookmarks
      .map((bookmark) => {
        return `
        <a href="/name/${bookmark.name}">
        <div>NAME:${bookmark.name}</div>
        </a>
        <a href="/categories/${bookmark.category}">
        <div>CATEGORY:${bookmark.category}</div>
        </a>  
        <br>
        
        `;
      })
      .join("");

    res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Document</title>
        </head>
        <body>
            ${html}
            <form method='POST'>
            <input name="name" placeholder="name"/>
            <input name="category" placeholder="category"/>
            <button>Submit
            </button>
            </form>
        </body>
        </html>`);
  } catch (error) {
    next(error);
  }
});

app.post("/bookmarks", async (req, res, next) => {
  try {
    const bookmark = await Bookmark.create(req.body);
    res.redirect(`/categories/${bookmark.category}`);
  } catch (err) {
    next(err);
  }
});

app.get("/categories/:id", async (req, res, next) => {
  // Find all bookmarks
  try {
    const bookmarks = await Bookmark.findAll({
      where: {
        category: req.params.id,
      },
    });
    const html = bookmarks
      .map((bookmark) => {
        return `
        <a href="/name/${bookmark.name}">
        <div>NAME:${bookmark.name}</div>
        </a>
        <div>CATEGORY:${bookmark.category}</div>
        <form method="POST" action="/bookmarks/${bookmark.id}?_method=delete">
                    <button>X</button>
        </form>
        <br>

        `;
      })
      .join("");

    res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Document</title>
        </head>
        <body>
            ${html}
            <div>
            <a href="/">
            Back Home
            </a>
            </div>
        </body>
        </html>`);
  } catch (error) {
    next(error);
  }
});
app.get("/name/:id", async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: {
        name: req.params.id,
      },
    });
    const html = bookmarks
      .map((bookmark) => {
        return `
        <div>NAME:${bookmark.name}</div>
        <a href="/categories/${bookmark.category}">
        <div>CATEGORY:${bookmark.category}</div>
        </a>  
        <br>
        `;
      })
      .join("");

    res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Document</title>
        </head>
        <body>
            ${html}
            <div>
            <a href="/">
            Back Home
            </a>
            </div>
        </body>
        </html>`);
  } catch (error) {
    next(error);
  }
});

go();
