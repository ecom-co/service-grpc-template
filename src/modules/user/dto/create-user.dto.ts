import { StringField, EmailField, PasswordField } from '@ecom-co/utils';

export class CreateUserDto {
    @StringField({
        minLength: 2,
        maxLength: 50,
        description: 'User full name',
        trim: true,
    })
    name: string;

    @EmailField({
        description: 'User email address',
        toLowerCase: true,
    })
    email: string;

    @PasswordField(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
        description: 'User password (min 6 characters, must contain letters and numbers)',
    })
    password: string;
}
