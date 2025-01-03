import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) { }


  private createResponse(message: string, data: any = null) {
    return { message, data };
  }

  async create(userId: number, createAppointmentDto: CreateAppointmentDto) {
    try {
      const newAppointment = await this.prisma.appointment.create({
        data: {
          ...createAppointmentDto,
          status: 'pending',
          userId
        },
      });

      if (createAppointmentDto.paymentMethod === 'POS') {
        // Logic for sending confirmation email (implement as needed)
        return this.createResponse('Appointment has been booked. Email will be sent after approval.', newAppointment);
      } else {
        return this.createResponse(
          'We will send you a confirmation email once the payment is approved.',
          newAppointment,
        );
      }
    } catch (error) {
      throw new Error('Error creating appointment: ' + error.message);
    }
  }

  async findAll() {
    try {
      const appointments = await this.prisma.appointment.findMany({
        include: { branch: true, user: true },
      });
      return this.createResponse('Appointments retrieved successfully', appointments);
    } catch (error) {
      throw new Error('Error retrieving appointments: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
        include: { branch: true, user: true },
      });

      if (!appointment) {
        return this.createResponse('Appointment not found');
      }
      return this.createResponse('Appointment retrieved successfully', appointment);
    } catch (error) {
      throw new Error('Error retrieving appointment: ' + error.message);
    }
  }

  async findUserAppointments(userId: number) {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: { userId },
        include: { branch: true },
      });
      return this.createResponse('User appointments retrieved successfully', appointments);
    } catch (error) {
      throw new Error('Error retrieving user appointments: ' + error.message);
    }
  }
  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    try {
      const existingAppointment = await this.prisma.appointment.findUnique({ where: { id } });

      if (!existingAppointment) {
        return this.createResponse('Appointment not found');
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
        data: updateAppointmentDto,
      });

      return this.createResponse('Appointment updated successfully', updatedAppointment);
    } catch (error) {
      throw new Error('Error updating appointment: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const existingAppointment = await this.prisma.appointment.findUnique({ where: { id } });

      if (!existingAppointment) {
        return this.createResponse('Appointment not found');
      }

      const deletedAppointment = await this.prisma.appointment.delete({ where: { id } });

      return this.createResponse('Appointment deleted successfully', deletedAppointment);
    } catch (error) {
      throw new Error('Error deleting appointment: ' + error.message);
    }
  }

  async getFutureAppointmentSlots(branchId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to the start of the day

      const futureAppointments = await this.prisma.appointment.findMany({
        where: {
          branchId,
          AND: [
            { date: { gte: today } }, // Filter for appointments from today onwards
          ],
        },
        select: {
          date: true, // Only select the slotTime field
        },
      });

      const slots = futureAppointments.map(appointment => appointment.date);

      return this.createResponse('Future appointment slots retrieved successfully', slots);
    } catch (error) {
      throw new Error('Error retrieving future appointment slots: ' + error.message);
    }
  }

}
