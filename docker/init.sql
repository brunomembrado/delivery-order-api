-- Initialize database extensions and settings
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas if needed
-- Note: Prisma will handle table creation through migrations

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE delivery_orders TO delivery_user;
