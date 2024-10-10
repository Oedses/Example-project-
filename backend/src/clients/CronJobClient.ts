import { CronCommand, CronJob, CronTime } from "cron";

export class CronJobClient {

  job = (time: CronTime, cb: CronCommand ) => {
    return new CronJob(time as any, cb);
  };
}