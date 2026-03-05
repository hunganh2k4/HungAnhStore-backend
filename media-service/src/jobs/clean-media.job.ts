// import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import { CloudinaryService } from '../services/cloudinary.service';

// @Injectable()
// export class CleanMediaJob {

//   constructor(
//     private readonly cloudinaryService: CloudinaryService,
//   ) {}

//   // chạy mỗi 6 giờ
//   @Cron('0 */6 * * *')
//   async cleanUnusedMedia() {

//     const result =
//       await this.cloudinaryService.listMedia();

//     const now = new Date();

//     for (const file of result.resources) {

//       const created = new Date(file.created_at);

//       const hours =
//         (now.getTime() - created.getTime()) /
//         (1000 * 60 * 60);

//       if (hours > 6) {

//         await this.cloudinaryService.deleteFile(
//           file.public_id,
//           file.resource_type,
//         );

//         console.log('Deleted unused media:', file.public_id);
//       }
//     }
//   }
// }