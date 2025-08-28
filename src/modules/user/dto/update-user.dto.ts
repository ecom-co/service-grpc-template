import { PartialType } from '@ecom-co/utils';

import { CreateUserDto } from '@/modules/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
