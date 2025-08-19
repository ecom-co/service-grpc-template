import { EmailFieldOptional, StringFieldOptional } from '@ecom-co/utils';

export class UpdateUserDto {
    @EmailFieldOptional({
        description: 'User email address',
        toLowerCase: true,
    })
    email?: string;

    @StringFieldOptional({
        description: 'User full name',
        maxLength: 50,
        minLength: 2,
        trim: true,
    })
    name?: string;
}
