import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('validator')
export class ValidatorProcessor {
  @Process()
  async handleJob(job: Job<any>) {
    console.log('Processing job:', job.data);
    // Your job processing logic here
    await new Promise((resolve, reject) => {
      // setTimeout(resolve, 1000);

      try {
        // 1. convert data.pdf to img
        // 2. fetch all pdf-imgs of target repo from pocketbase-s3
        // 3. compare target and request pdf-imgs and find a match
        // 4. save match reseult to pocketbase
      } catch (error) {
        reject(error);
      }
    });

    console.log('Job completed');
  }
}
