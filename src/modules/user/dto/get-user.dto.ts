import { UUIDField } from '@ecom-co/utils';

export class GetUserDto {
    @UUIDField({
        description: 'User unique identifier',
    })
    id: string;
}
