import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { FolderGraphqlModule } from './folder-graphql/folder-graphql.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: false,
            typePaths: ['./**/*.graphql'],
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
        }),
        FolderGraphqlModule,
    ],
})
export class HttpModule {}
