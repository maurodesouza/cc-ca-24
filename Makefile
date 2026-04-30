dev:
	cd backend/account-service && pnpm dev & \
	cd backend/match-engine-service && pnpm dev & \
	cd backend/order-service && pnpm dev & \
	await