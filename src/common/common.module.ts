import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { CommonService } from './common.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [CommonService, ResponseService, MessageService],
  exports: [HttpModule],
})
export class CommonModule {}
