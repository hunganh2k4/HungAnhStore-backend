import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReviewDto {

  @IsInt()
  productLineId: number;

  @IsString()
  userId: String;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  medias?: {
    url: string;
    type: string;
    publicId: string;
  }[];
}