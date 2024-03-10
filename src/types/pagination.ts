export class Paged {
     offset?: number = 0;
     limit?: number = 10;
     constructor(offset: number, limit: number) {
         this.offset = offset;
         this.limit = limit;
     }
 }