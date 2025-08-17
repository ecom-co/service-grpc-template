import { StringFieldOptional, EmailFieldOptional } from '@ecom-co/utils';

export class UpdateUserDto {
    @StringFieldOptional({
        minLength: 2,
        maxLength: 50,
        description: 'User full name',
        trim: true,
    })
    name?: string;

    @EmailFieldOptional({
        description: 'User email address',
        toLowerCase: true,
    })
    email?: string;
}
