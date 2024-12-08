import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { RequestContextModule } from './request-context/request-context.module';
import { FolderGraphqlModule } from './folder-graphql/folder-graphql.module';
import { RealityIdMiddleware } from './middlewares/reality-id.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EndpointModule } from './endpoints/endpoint.module';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
    imports: [
        EndpointModule,
        FolderGraphqlModule,
        RequestContextModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: false,
            typePaths: ['./**/*.graphql'],
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
        }),
    ],
})
export class HttpModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RealityIdMiddleware).forRoutes('*');
    }
}
