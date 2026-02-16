/**
 * Base Service Interface
 * All services must implement these CRUD operations
 */
export interface IBaseService<T, CreateInput, UpdateInput> {
	create(input: CreateInput): Promise<T>
	getById(id: string): Promise<T | null>
	update(id: string, input: UpdateInput): Promise<void>
	delete(id: string): Promise<void>
}
