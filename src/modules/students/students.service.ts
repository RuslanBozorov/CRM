import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create.student.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateStudentDto } from './dto/update.student.dto';
@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async createStudent(payload: CreateStudentDto, filename: string) {
        const existUser = await this.prisma.student.findFirst({
            where: {
                OR: [{ phone: payload.phone }, { email: payload.email }],
            },
        });

        if (existUser) {
            throw new ConflictException();
        }
        const hashPass = await bcrypt.hash(payload.password, 10);
        await this.prisma.student.create({
            data: {
                first_name: payload.first_name,
                last_name: payload.last_name,
                photo: filename ?? null,
                phone: payload.phone,
                birth_date: new Date(payload.birth_date),
                email: payload.email,
                password: hashPass,
                address: payload.address,
            },
        });
        return {
            success: true,
            message: 'Student create',
        };
    }

    async getAllStudets() {
        await this.prisma.student.findMany()
        return {
            success: true,
            message: "All Students"
        }
    }

    async getOneStudent(id) {
        const existStudent = await this.prisma.student.findUnique(id)
        if (!existStudent) throw new NotFoundException()
        await this.prisma.student.findUnique(id)
        return {
            success: true,
            message: "Get one Student"
        }
    }

   async updateStudent(id, payload: UpdateStudentDto) {
       const findId = this.prisma.student.findUnique({ where: { id: Number(id) } });
       if (!findId) {
         throw new NotFoundException();
       }
       await this.prisma.student.update({ where: { id: Number(id) }, data: payload });
       return {
         success: true,
         message: 'Student Update',
       };
     }
   
     async deleteStudent(id) {
       const findId = this.prisma.student.findUnique({ where: { id: Number(id) } });
       if (!findId) {
         throw new NotFoundException();
       }
       await this.prisma.student.delete({ where: { id } });
       return {
         success: true,
         message: 'Student delete',
       };
     }
}
