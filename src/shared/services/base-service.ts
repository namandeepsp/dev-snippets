import type { IBaseService } from './base-service.interface'

/**
 * Base Repository Interface
 * Repository layer that the base service depends on
 */
export interface IBaseRepository<T, CreateInput, UpdateInput> {
	create(input: CreateInput): Promise<T>
	getById(id: string): Promise<T | null>
	update(id: string, input: UpdateInput): Promise<void>
	delete(id: string): Promise<void>
}

/**
 * Abstract Base Service
 * Implements common CRUD operations
 * Extend this class for feature-specific services
 */
export abstract class BaseService<T, CreateInput, UpdateInput>
	implements IBaseService<T, CreateInput, UpdateInput>
{
	constructor(
		protected readonly repository: IBaseRepository<T, CreateInput, UpdateInput>,
	) {}

	async create(input: CreateInput): Promise<T> {
		return this.repository.create(input)
	}

	async getById(id: string): Promise<T | null> {
		return this.repository.getById(id)
	}

	async update(id: string, input: UpdateInput): Promise<void> {
		return this.repository.update(id, input)
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id)
	}
}
