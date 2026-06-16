import {
  Question as PrismaQuestion,
  User as PrismaUser,
  Attachment as PrismaAttachment,
} from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { PrismaAttachmentMapper } from './prisma-attachment-mapper'
import { Attachment } from '@/domain/forum/enterprise/entities/attachment'

type PrismaQuestionDetails = PrismaQuestion & {
  author: PrismaUser
  attachments: PrismaAttachment[]
}

type CachedQuestionDetails = {
  props?: {
    questionId: { value: string }
    authorId: { value: string }
    author: string
    title: string
    content: string
    slug: { value: string }
    attachments: Array<{
      _id: { value: string }
      props: {
        title: string
        url: string
      }
    }>
    bestAnswerId?: { value: string } | null
    createdAt: string
    updatedAt?: string | null
  }
}

export class PrismaQuestionDetailsMapper {
  static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
    return QuestionDetails.create({
      questionId: new UniqueEntityID(raw.id),
      authorId: new UniqueEntityID(raw.author.id),
      author: raw.author.name,
      title: raw.title,
      slug: Slug.create(raw.slug),
      attachments: raw.attachments.map(PrismaAttachmentMapper.toDomain),
      bestAnswerId: raw.bestAnswerId
        ? new UniqueEntityID(raw.bestAnswerId)
        : null,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  static toDomainFromCache(raw: CachedQuestionDetails): QuestionDetails | null {
    const props = raw.props

    if (!props) {
      return null
    }

    return QuestionDetails.create({
      questionId: new UniqueEntityID(props.questionId.value),
      authorId: new UniqueEntityID(props.authorId.value),
      author: props.author,
      title: props.title,
      content: props.content,
      slug: Slug.create(props.slug.value),
      attachments: props.attachments.map((attachment) => {
        return Attachment.create(
          {
            title: attachment.props.title,
            url: attachment.props.url,
          },
          new UniqueEntityID(attachment._id.value),
        )
      }),
      bestAnswerId: props.bestAnswerId
        ? new UniqueEntityID(props.bestAnswerId.value)
        : null,
      createdAt: new Date(props.createdAt),
      updatedAt: props.updatedAt ? new Date(props.updatedAt) : null,
    })
  }
}
