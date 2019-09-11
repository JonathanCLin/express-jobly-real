\c jobly

DROP TABLE IF EXISTS companies;


CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY, 
    title text NOT NULL, 
    salary float NOT NULL, 
    equity float NOT NULL,
    company_handle text REFERENCES companies ON DELETE CASCADE, 
    date_posted TIMESTAMP,
    CHECK (equity < 1)
);
