import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ILoanRepository } from '../../domain/interfaces/loan.repository.interface';
import { Contact } from '../../domain/entities/loan.entity';
import { CreateContactDto } from '../../application/dto/loan/create-contact.dto';

@Injectable()
export class CreateContactUseCase {
  constructor(private readonly repository: ILoanRepository) {}

  async execute(dto: CreateContactDto & { userId: string }): Promise<Contact> {
    const contact = new Contact(
      uuidv4(),
      dto.userId,
      dto.contactType,
      dto.name,
      dto.email,
      dto.phone,
      dto.relationship
    );

    return this.repository.createContact(contact);
  }
}
