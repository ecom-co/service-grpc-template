import { EmailField, IsNotEmpty, PasswordField, StringField } from '@ecom-co/utils';

export class CreateUserDto {
    @IsNotEmpty()
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
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @PasswordField(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {})
    password: string;
}
