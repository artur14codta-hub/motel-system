CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  data_nascimento TEXT,
  cpf TEXT UNIQUE,
  telefone TEXT,
  cargo TEXT,
  email TEXT UNIQUE,
  senha TEXT,
  is_admin INTEGER DEFAULT 0
);

CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER NOT NULL,
  status TEXT DEFAULT 'livre'
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  preco REAL,
  quantidade INTEGER
);

CREATE TABLE consumptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  product_id INTEGER,
  quantidade INTEGER,
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  valor REAL,
  forma_pagamento TEXT,
  data TEXT,
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);
```