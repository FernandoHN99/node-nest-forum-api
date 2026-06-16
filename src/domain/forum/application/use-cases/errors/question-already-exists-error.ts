import { UseCaseError } from '@/core/errors/use-case-error'

export class QuestionAlreadyExistsError extends Error implements UseCaseError {
  constructor(slug: string) {
    super(`Question with slug "${slug}" already exists.`)
  }
}
