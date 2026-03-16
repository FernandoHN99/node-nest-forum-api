import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import { AttachmentPresenter } from './attachment-presenter'

// TODO
export class QuestionDetailsPresenter {
  static toHTTP(questionDetails: QuestionDetails) {
   console.log('questionDetails: ', JSON.parse(JSON.stringify(questionDetails)).props.questionId.value)
    return {
      questionId: questionDetails?.questionId?.toString(),
      // authorId: questionDetails?.authorId?.toString(),
      author: questionDetails.author,
      title: questionDetails.title,
      content: questionDetails.content,
      // slug: questionDetails.slug.value,
      // bestAnswerId: questionDetails.bestAnswerId?.toString(),
      // attachments: questionDetails.attachments.map(AttachmentPresenter.toHTTP),
      createdAt: questionDetails.createdAt,
      updatedAt: questionDetails.updatedAt,
    }
  }
}
