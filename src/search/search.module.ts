import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'https://localhost:9200',
        auth: {
          username: 'elastic',
          password: 'changeme',
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
    }),
  ],
  exports: [SearchService],
  providers: [SearchService],
})
export class SearchModule {}
