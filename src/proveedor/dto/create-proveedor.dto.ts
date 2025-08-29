import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'El celular solo debe contener números' })
  @Length(7, 12, { message: 'El celular debe tener entre 7 y 12 dígitos' })
  telefono: string;
}
