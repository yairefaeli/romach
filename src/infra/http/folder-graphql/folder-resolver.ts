import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver('Folder')
export class FolderResolver {
    constructor() {}

    @Query('checkFolder')
    async checkFolder(
        @Args('folderId')
        folderId: string,

        @Args('password')
        password: string,
    ) {
        return `Checking folder ${folderId} with password ${password}`;
    }
}
