import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { LlmService } from 'src/llm/llm.service';
import { LlmModule } from 'src/llm/llm.module';

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
    LlmModule,
  ],
  exports: [SearchService],
  providers: [SearchService],
})
export class SearchModule {}
