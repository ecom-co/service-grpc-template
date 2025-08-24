import { EmailField, IsNotEmpty, IsOptional, PasswordField, StringField } from '@ecom-co/utils';

export class CreateUserDto {
    @EmailField({
        description: 'User email address',
        toLowerCase: true,
    })
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @StringField({
        description: 'User unique username',
        maxLength: 30,
        minLength: 3,
        trim: true,
    })
    username?: string;

    @IsNotEmpty()
    @StringField({
        description: 'User first name',
        maxLength: 50,
        minLength: 1,
        trim: true,
    })
    firstName: string;

    @IsOptional()
    @StringField({
        description: 'User last name',
        maxLength: 50,
        minLength: 1,
        trim: true,
    })
    lastName?: string;

    @IsNotEmpty()
    @PasswordField(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
        description: 'User password - must contain at least 6 characters with letters and numbers',
    })
    password: string;
}
