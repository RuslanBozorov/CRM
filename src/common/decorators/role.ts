import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// ================= Run Prettier to format the code =================
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
