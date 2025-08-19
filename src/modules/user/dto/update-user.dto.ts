import { EmailFieldOptional, StringFieldOptional } from '@ecom-co/utils';

export class UpdateUserDto {
    @StringFieldOptional({
        description: 'User full name',
        maxLength: 50,
        minLength: 2,
        trim: true,
    })
    name?: string;

    @EmailFieldOptional({
        description: 'User email address',
        toLowerCase: true,
    })
    email?: string;
}
