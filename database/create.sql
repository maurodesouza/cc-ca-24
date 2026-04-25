drop schema if exists ccca;

create schema ccca;

create table ccca.account (
    account_id uuid primary key,
    name text,
    email text,
    document text,
    password text
);

create table ccca.balance (
	account_id uuid,
	asset_id text,
	quantity numeric,
	blocked_quantity numeric,
	primary key (account_id, asset_id)
);

create table ccca.order (
	order_id uuid,
	market_id text,
	account_id uuid,
	side text,
	quantity numeric,
	price numeric,
	fill_quantity numeric,
	fill_price numeric,
	status text,
	timestamp timestamptz,
	primary key (order_id)
);