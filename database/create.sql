drop schema if exists ccca;

create schema ccca;

create table ccca.account (
    account_id uuid primary key,
    name text,
    email text,
    document text,
    password text
);

create table ccca.fund (
    fund_id uuid primary key,

    account_id uuid,
    asset_id text,
    quantity numeric
);