import { UserService } from './core/user.service'
import { FirebaseUserPort } from './infra/repositories/firebase-user.repository'

export type {
	User,
	PublicUser,
	CreateUserDTO,
	UpdateUserDTO,
} from './core/user.types'

export type {
	UserDomainError,
	DomainErrorCode,
} from './core/user.service'
const userPort = new FirebaseUserPort()
export const userService = new UserService(userPort)
