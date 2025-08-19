import { EmailField, PasswordField, StringField } from '@ecom-co/utils';

export class CreateUserDto {
    @StringField({
        description: 'User full name',
        maxLength: 50,
        minLength: 2,
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
