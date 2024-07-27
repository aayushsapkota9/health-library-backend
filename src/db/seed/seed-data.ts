import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/auth/enums/role.enum';

export async function seedData(dataSource: DataSource): Promise<void> {
  try {
    const userRepository = dataSource.getRepository(User);

    const usersToSeed: Partial<User>[] = [
      {
        email: 'admin@admin.com',
        fullName: 'Admin',
        roles: [Role.Admin],
        password: 'Hello@123',
      },
    ];
    usersToSeed[0].password = await bcrypt.hash('Hello@123', 10);

    await userRepository.save(usersToSeed);
  } catch (error) {}
}
