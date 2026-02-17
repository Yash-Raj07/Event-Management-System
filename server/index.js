import express from "express";
import session from "express-session";
import cors from "cors";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "ems.db");

const SQLiteStore = session.MemoryStore;

const app = express();
const PORT = 4000;

const db = new sqlite3.Database(dbPath);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: "change-this-secret",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore(),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS memberships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        membership_no TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_details TEXT NOT NULL,
        category TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        FOREIGN KEY (vendor_id) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PLACED',
        created_at TEXT NOT NULL
      )`
    );

    db.run(
      "ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'PLACED'",
      (err) => {
        if (err && !String(err.message).includes("duplicate column name")) {
          console.error(err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
      )`
    );

    const defaultUsers = [
      { username: "admin", password: "admin123", role: "admin" },
      { username: "user1", password: "user123", role: "user" },
      { username: "vendor1", password: "vendor123", role: "vendor" },
      { username: "vendor2", password: "vendor123", role: "vendor" },
      { username: "vendor3", password: "vendor123", role: "vendor" },
      { username: "vendor4", password: "vendor123", role: "vendor" },
    ];

    defaultUsers.forEach((u) => {
      db.get(
        "SELECT id FROM users WHERE username = ?",
        [u.username],
        async (err, row) => {
          if (err) {
            console.error(err);
            return;
          }
          if (!row) {
            const hash = await bcrypt.hash(u.password, 10);
            db.run(
              "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
              [u.username, hash, u.role],
              function insertVendor(vendorErr) {
                if (vendorErr) {
                  console.error(vendorErr);
                  return;
                }
                if (u.role === "vendor") {
                  db.run(
                    "INSERT INTO vendors (name, contact_details, category) VALUES (?, ?, ?)",
                    [
                      u.username,
                      `Contact details for ${u.username}`,
                      "Florist",
                    ]
                  );
                }
              }
            );
          }
        }
      );
    });
  });
}

initDb();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "User Id, Password and role are required" });
  }

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (!user || user.role !== role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      res.json({ username: user.username, role: user.role });
    }
  );
});

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, Email and Password required" });
  }
  db.get(
    "SELECT id FROM users WHERE username = ?",
    [email],
    async (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (row) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hash = await bcrypt.hash(password, 10);
      db.run(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')",
        [email, hash],
        function insertUser(insertErr) {
          if (insertErr) {
            return res.status(500).json({ message: "Database error" });
          }
          res
            .status(201)
            .json({ id: this.lastID, username: email, role: "user" });
        }
      );
    }
  );
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

app.get("/api/session", (req, res) => {
  if (!req.session.user) {
    return res.json(null);
  }
  res.json(req.session.user);
});

app.post("/api/memberships", requireAuth, requireRole("admin"), (req, res) => {
  const { membershipNo, name, email, startDate, duration } = req.body;
  if (!membershipNo || !name || !email || !startDate || !duration) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  const months =
    duration === "6" ? 6 : duration === "12" ? 12 : duration === "24" ? 24 : 6;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return res.status(400).json({ message: "Invalid start date" });
  }
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  db.get(
    "SELECT id FROM memberships WHERE membership_no = ?",
    [membershipNo],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (row) {
        return res
          .status(400)
          .json({ message: "Membership number already exists" });
      }
      db.run(
        `INSERT INTO memberships
        (membership_no, name, email, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [
          membershipNo,
          name,
          email,
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10),
        ],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({ message: "Database error" });
          }
          res.status(201).json({ id: this.lastID });
        }
      );
    }
  );
});

app.get("/api/vendors", requireAuth, (req, res) => {
  db.all("SELECT * FROM vendors", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});

app.get("/api/vendor/:vendorId/products", requireAuth, (req, res) => {
  const vendorId = req.params.vendorId;
  db.all(
    "SELECT * FROM products WHERE vendor_id = ? ORDER BY id DESC",
    [vendorId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows);
    }
  );
});

app.get(
  "/api/vendor/products",
  requireAuth,
  requireRole("vendor"),
  (req, res) => {
    const vendorId = req.session.user.id;
    db.all(
      "SELECT * FROM products WHERE vendor_id = ? ORDER BY id DESC",
      [vendorId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        res.json(rows);
      }
    );
  }
);

app.post(
  "/api/vendor/products",
  requireAuth,
  requireRole("vendor"),
  (req, res) => {
    const vendorId = req.session.user.id;
    const { name, price, imageUrl } = req.body;
    if (!name || !price) {
      return res
        .status(400)
        .json({ message: "Product name and price are required" });
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be positive number" });
    }
    db.run(
      "INSERT INTO products (vendor_id, name, price, image_url) VALUES (?, ?, ?, ?)",
      [vendorId, name, numericPrice, imageUrl || null],
      function insertProduct(err) {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({
          id: this.lastID,
          vendor_id: vendorId,
          name,
          price: numericPrice,
          image_url: imageUrl || null,
        });
      }
    );
  }
);

app.put(
  "/api/vendor/products/:id",
  requireAuth,
  requireRole("vendor"),
  (req, res) => {
    const vendorId = req.session.user.id;
    const productId = req.params.id;
    const { name, price, imageUrl } = req.body;
    if (!name || !price) {
      return res
        .status(400)
        .json({ message: "Product name and price are required" });
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be positive number" });
    }
    db.run(
      "UPDATE products SET name = ?, price = ?, image_url = ? WHERE id = ? AND vendor_id = ?",
      [name, numericPrice, imageUrl || null, productId, vendorId],
      function updateProduct(err) {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product updated" });
      }
    );
  }
);

app.delete(
  "/api/vendor/products/:id",
  requireAuth,
  requireRole("vendor"),
  (req, res) => {
    const vendorId = req.session.user.id;
    const productId = req.params.id;
    db.run(
      "DELETE FROM products WHERE id = ? AND vendor_id = ?",
      [productId, vendorId],
      function deleteProduct(err) {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted" });
      }
    );
  }
);

app.get("/api/cart", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  db.all(
    `SELECT ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.image_url,
            (ci.quantity * p.price) AS line_total
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      const total = rows.reduce(
        (sum, row) => sum + Number(row.line_total || 0),
        0
      );
      res.json({ items: rows, total });
    }
  );
});

app.post("/api/cart/add", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;
  if (!productId || qty <= 0) {
    return res
      .status(400)
      .json({ message: "Product and positive quantity required" });
  }
  db.get(
    "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (row) {
        const newQty = row.quantity + qty;
        db.run(
          "UPDATE cart_items SET quantity = ? WHERE id = ?",
          [newQty, row.id],
          function updateErr() {
            if (updateErr) {
              return res.status(500).json({ message: "Database error" });
            }
            return res.json({ message: "Cart updated" });
          }
        );
      } else {
        db.run(
          "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, productId, qty],
          function insertErr() {
            if (insertErr) {
              return res.status(500).json({ message: "Database error" });
            }
            return res.status(201).json({ message: "Added to cart" });
          }
        );
      }
    }
  );
});

app.put("/api/cart/item/:productId", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const productId = req.params.productId;
  const { quantity } = req.body;
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty < 0) {
    return res.status(400).json({ message: "Quantity must be 0 or more" });
  }
  if (qty === 0) {
    db.run(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
      function deleteErr() {
        if (deleteErr) {
          return res.status(500).json({ message: "Database error" });
        }
        return res.json({ message: "Item removed" });
      }
    );
  } else {
    db.run(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [qty, userId, productId],
      function updateErr() {
        if (updateErr) {
          return res.status(500).json({ message: "Database error" });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: "Item not found" });
        }
        return res.json({ message: "Quantity updated" });
      }
    );
  }
});

app.delete("/api/cart/item/:productId", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const productId = req.params.productId;
  db.run(
    "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    function deleteErr() {
      if (deleteErr) {
        return res.status(500).json({ message: "Database error" });
      }
      return res.json({ message: "Item removed" });
    }
  );
});

app.delete("/api/cart", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  db.run(
    "DELETE FROM cart_items WHERE user_id = ?",
    [userId],
    function deleteErr() {
      if (deleteErr) {
        return res.status(500).json({ message: "Database error" });
      }
      return res.json({ message: "Cart cleared" });
    }
  );
});

app.post("/api/checkout", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const {
    name,
    email,
    phone,
    address,
    city,
    state,
    pinCode,
    paymentMethod,
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !state ||
    !pinCode ||
    !paymentMethod
  ) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  db.all(
    `SELECT ci.product_id,
            ci.quantity,
            p.price
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?`,
    [userId],
    (err, items) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const total = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const createdAt = new Date().toISOString();
      db.run(
        `INSERT INTO orders
          (user_id, total_amount, name, email, phone, address, city, state, pin_code, payment_method, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          total,
          name,
          email,
          phone,
          address,
          city,
          state,
          pinCode,
          paymentMethod,
          "PLACED",
          createdAt,
        ],
        function insertOrder(errInsert) {
          if (errInsert) {
            return res.status(500).json({ message: "Database error" });
          }
          const orderId = this.lastID;
          const stmt = db.prepare(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
          );
          items.forEach((item) => {
            stmt.run(orderId, item.product_id, item.quantity, item.price);
          });
          stmt.finalize();
          db.run(
            "DELETE FROM cart_items WHERE user_id = ?",
            [userId],
            function clearErr() {
              if (clearErr) {
                return res.status(500).json({ message: "Database error" });
              }
              return res.json({
                orderId,
                total,
                name,
                email,
                phone,
                address,
                city,
                state,
                pinCode,
                paymentMethod,
              });
            }
          );
        }
      );
    }
  );
});

app.get("/api/orders/my", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  db.all(
    `SELECT id,
            total_amount,
            name,
            email,
            phone,
            address,
            city,
            state,
            pin_code,
            payment_method,
            status,
            created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY datetime(created_at) DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows);
    }
  );
});

app.get(
  "/api/vendor/orders",
  requireAuth,
  requireRole("vendor"),
  (req, res) => {
    const vendorId = req.session.user.id;
    db.all(
      `SELECT DISTINCT o.id,
              o.total_amount,
              o.name,
              o.email,
              o.phone,
              o.address,
              o.city,
              o.state,
              o.pin_code,
              o.payment_method,
              o.status,
              o.created_at
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE p.vendor_id = ?
       ORDER BY datetime(o.created_at) DESC`,
      [vendorId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        res.json(rows);
      }
    );
  }
);

app.put("/api/orders/:orderId/status", requireAuth, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }
  const allowedStatuses = [
    "PLACED",
    "RECEIVED",
    "READY_FOR_SHIPPING",
    "OUT_FOR_DELIVERY",
    "IN_PROGRESS",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const user = req.session.user;
  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return res.status(403).json({ message: "Access denied" });
  }
  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
    function updateStatus(err) {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json({ message: "Status updated" });
    }
  );
});

app.get(
  "/api/memberships/:membershipNo",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const membershipNo = req.params.membershipNo;
    db.get(
      "SELECT * FROM memberships WHERE membership_no = ?",
      [membershipNo],
      (err, row) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        if (!row) {
          return res.status(404).json({ message: "Membership not found" });
        }
        res.json(row);
      }
    );
  }
);

app.post(
  "/api/memberships/:membershipNo/update",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const membershipNo = req.params.membershipNo;
    const { action, extension } = req.body;

    db.get(
      "SELECT * FROM memberships WHERE membership_no = ?",
      [membershipNo],
      (err, membership) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        if (!membership) {
          return res.status(404).json({ message: "Membership not found" });
        }
        if (membership.status === "CANCELLED") {
          return res
            .status(400)
            .json({ message: "Cannot modify a cancelled membership" });
        }

        if (action === "cancel") {
          db.run(
            "UPDATE memberships SET status = 'CANCELLED' WHERE id = ?",
            [membership.id],
            function (updateErr) {
              if (updateErr) {
                return res.status(500).json({ message: "Database error" });
              }
              return res.json({ message: "Membership cancelled" });
            }
          );
        } else if (action === "extend") {
          const months =
            extension === "6"
              ? 6
              : extension === "12"
              ? 12
              : extension === "24"
              ? 24
              : 6;
          const currentEnd = new Date(membership.end_date);
          if (Number.isNaN(currentEnd.getTime())) {
            return res.status(400).json({ message: "Invalid current end date" });
          }
          currentEnd.setMonth(currentEnd.getMonth() + months);
          const newEnd = currentEnd.toISOString().slice(0, 10);

          db.run(
            "UPDATE memberships SET end_date = ? WHERE id = ?",
            [newEnd, membership.id],
            function (updateErr) {
              if (updateErr) {
                return res.status(500).json({ message: "Database error" });
              }
              return res.json({ message: "Membership extended", end_date: newEnd });
            }
          );
        } else {
          return res.status(400).json({ message: "Invalid action" });
        }
      }
    );
  }
);

app.listen(PORT, () => {
  console.log(`EMS server running on http://localhost:${PORT}`);
});
