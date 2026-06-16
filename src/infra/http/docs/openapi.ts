import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

const bearerAuthName = 'bearer'

const uuid = (example: string, description?: string) => ({
  type: 'string',
  format: 'uuid',
  example,
  ...(description ? { description } : {}),
})

const dateTime = (example: string) => ({
  type: 'string',
  format: 'date-time',
  example,
})

const nullableDateTime = (example: string) => ({
  ...dateTime(example),
  nullable: true,
})

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 400 },
    message: {
      oneOf: [
        { type: 'string', example: 'Validation failed' },
        {
          type: 'array',
          items: { type: 'string' },
          example: ['Unauthorized'],
        },
      ],
    },
    error: { type: 'string', example: 'Bad Request' },
    errors: {
      type: 'object',
      additionalProperties: true,
      example: {
        name: 'ZodValidationError',
        details: [
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['title'],
            message: 'Required',
          },
        ],
      },
    },
  },
}

const validationErrorExample = {
  statusCode: 400,
  message: 'Validation failed',
  errors: {
    name: 'ZodValidationError',
    details: [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['title'],
        message: 'Required',
      },
    ],
  },
}

const unauthorizedExample = {
  statusCode: 401,
  message: 'Unauthorized',
}

const internalServerErrorExample = {
  statusCode: 500,
  message: 'Internal server error',
}

const badRequestResponse = (description: string) =>
  ApiBadRequestResponse({
    description,
    schema: {
      ...errorResponseSchema,
      example: validationErrorExample,
    },
  })

const unauthorizedResponse = () =>
  ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token.',
    schema: {
      ...errorResponseSchema,
      example: unauthorizedExample,
    },
  })

const internalServerErrorResponse = () =>
  ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
    schema: {
      ...errorResponseSchema,
      example: internalServerErrorExample,
    },
  })

const protectedEndpoint = () =>
  applyDecorators(ApiBearerAuth(bearerAuthName), unauthorizedResponse())

const uuidParam = (name: string, description: string, example: string) =>
  ApiParam({
    name,
    description,
    schema: uuid(example),
  })

const pageQuery = () =>
  ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination. Defaults to 1.',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
      example: 1,
    },
  })

const attachmentSchema = {
  type: 'object',
  required: ['id', 'title', 'url'],
  properties: {
    id: uuid('c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f', 'Attachment ID.'),
    title: { type: 'string', example: 'architecture.pdf' },
    url: { type: 'string', example: 'f5f4a6f0-architecture.pdf' },
  },
}

const questionSchema = {
  type: 'object',
  required: ['id', 'title', 'slug', 'createdAt'],
  properties: {
    id: uuid('6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec', 'Question ID.'),
    title: { type: 'string', example: 'How do domain events work?' },
    slug: { type: 'string', example: 'how-do-domain-events-work' },
    bestAnswer: {
      ...uuid('72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
      nullable: true,
    },
    createdAt: dateTime('2026-06-16T01:41:44.215Z'),
    updatedAt: nullableDateTime('2026-06-16T01:45:10.216Z'),
  },
}

const questionDetailsSchema = {
  type: 'object',
  required: [
    'questionId',
    'authorId',
    'author',
    'title',
    'content',
    'slug',
    'attachments',
    'createdAt',
  ],
  properties: {
    questionId: uuid('6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec', 'Question ID.'),
    authorId: uuid('b3b7f660-0cfb-4c79-ae2d-c6d20dd5fc4f', 'Author ID.'),
    author: { type: 'string', example: 'John Doe' },
    title: { type: 'string', example: 'How do domain events work?' },
    content: {
      type: 'string',
      example: 'I want to understand when domain events are dispatched.',
    },
    slug: { type: 'string', example: 'how-do-domain-events-work' },
    bestAnswerId: {
      ...uuid('72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
      nullable: true,
    },
    attachments: {
      type: 'array',
      items: attachmentSchema,
    },
    createdAt: dateTime('2026-06-16T01:41:44.215Z'),
    updatedAt: nullableDateTime('2026-06-16T01:45:10.216Z'),
  },
}

const answerSchema = {
  type: 'object',
  required: ['id', 'content', 'createdAt'],
  properties: {
    id: uuid('72ecf947-10b9-4c14-a2ab-447ea74fdd88', 'Answer ID.'),
    content: {
      type: 'string',
      example: 'Use the aggregate root to dispatch it.',
    },
    createdAt: dateTime('2026-06-16T01:41:44.215Z'),
    updatedAt: nullableDateTime('2026-06-16T01:45:10.216Z'),
  },
}

const commentWithAuthorSchema = {
  type: 'object',
  required: ['commentId', 'authorId', 'authorName', 'content', 'createdAt'],
  properties: {
    commentId: uuid('9361e925-3759-4f20-81c5-b25cfcc1a230', 'Comment ID.'),
    authorId: uuid('b3b7f660-0cfb-4c79-ae2d-c6d20dd5fc4f', 'Author ID.'),
    authorName: { type: 'string', example: 'John Doe' },
    content: { type: 'string', example: 'This explanation helped a lot.' },
    createdAt: dateTime('2026-06-16T01:41:44.215Z'),
    updatedAt: nullableDateTime('2026-06-16T01:45:10.216Z'),
  },
}

const createAccountRequestSchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: { type: 'string', example: 'John Doe' },
    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
    password: { type: 'string', minLength: 1, example: '123456' },
  },
}

const authenticateRequestSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
    password: { type: 'string', minLength: 1, example: '123456' },
  },
}

const questionRequestSchema = {
  type: 'object',
  required: ['title', 'content', 'attachments'],
  properties: {
    title: { type: 'string', example: 'How do domain events work?' },
    content: {
      type: 'string',
      example: 'I want to understand when domain events are dispatched.',
    },
    attachments: {
      type: 'array',
      items: uuid('c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f'),
      example: ['c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f'],
    },
  },
}

const answerQuestionRequestSchema = {
  type: 'object',
  required: ['content', 'attachments'],
  properties: {
    content: {
      type: 'string',
      example: 'Use the aggregate root to dispatch it.',
    },
    attachments: {
      type: 'array',
      items: uuid('c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f'),
      example: [],
    },
  },
}

const editAnswerRequestSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', example: 'Updated answer content.' },
    attachments: {
      type: 'array',
      items: uuid('c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f'),
      default: [],
      example: [],
    },
  },
}

const commentRequestSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', example: 'This explanation helped a lot.' },
  },
}

const createAccountExample = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: '123456',
}

const authenticateExample = {
  email: 'john.doe@example.com',
  password: '123456',
}

const questionRequestExample = {
  title: 'How do domain events work?',
  content: 'I want to understand when domain events are dispatched.',
  attachments: ['c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f'],
}

const answerRequestExample = {
  content: 'Use the aggregate root to dispatch it.',
  attachments: [],
}

const commentRequestExample = {
  content: 'This explanation helped a lot.',
}

export function ApiCreateAccountDocs() {
  return applyDecorators(
    ApiTags('Users'),
    ApiOperation({
      summary: 'Create a student account',
      description:
        'Registers a new student account using name, email, and password.',
    }),
    ApiBody({
      description: 'Student registration payload.',
      schema: createAccountRequestSchema,
      examples: {
        default: { summary: 'Create account', value: createAccountExample },
      },
    }),
    ApiCreatedResponse({
      description: 'Student account created successfully.',
    }),
    badRequestResponse('Invalid request body.'),
    ApiConflictResponse({
      description: 'A student with the same email already exists.',
      schema: {
        ...errorResponseSchema,
        example: {
          statusCode: 409,
          message: 'Student "john.doe@example.com" already exists.',
          error: 'Conflict',
        },
      },
    }),
    internalServerErrorResponse(),
  )
}

export function ApiAuthenticateDocs() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Authenticate student',
      description:
        'Authenticates a student and returns a JWT bearer access token.',
    }),
    ApiBody({
      description: 'Student credentials.',
      schema: authenticateRequestSchema,
      examples: {
        default: { summary: 'Authenticate', value: authenticateExample },
      },
    }),
    ApiCreatedResponse({
      description: 'Authentication succeeded.',
      schema: {
        type: 'object',
        required: ['access_token'],
        properties: {
          access_token: {
            type: 'string',
            description: 'JWT bearer token signed with RS256.',
            example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        example: {
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    badRequestResponse('Invalid request body.'),
    ApiUnauthorizedResponse({
      description: 'Credentials are not valid.',
      schema: {
        ...errorResponseSchema,
        example: {
          statusCode: 401,
          message: 'Credentials are not valid.',
          error: 'Unauthorized',
        },
      },
    }),
    internalServerErrorResponse(),
  )
}

export function ApiCreateQuestionDocs() {
  return applyDecorators(
    ApiTags('Questions'),
    protectedEndpoint(),
    ApiOperation({
      summary: 'Create question',
      description: 'Creates a question for the authenticated student.',
    }),
    ApiBody({
      description: 'Question creation payload.',
      schema: questionRequestSchema,
      examples: {
        default: { summary: 'Create question', value: questionRequestExample },
      },
    }),
    ApiCreatedResponse({ description: 'Question created successfully.' }),
    badRequestResponse('Invalid request body or application error.'),
    ApiConflictResponse({
      description: 'A question with the generated slug already exists.',
      schema: {
        ...errorResponseSchema,
        example: {
          statusCode: 409,
          message:
            'Question with slug "how-do-domain-events-work" already exists.',
          error: 'Conflict',
        },
      },
    }),
    internalServerErrorResponse(),
  )
}

export function ApiFetchRecentQuestionsDocs() {
  return applyDecorators(
    ApiTags('Questions'),
    protectedEndpoint(),
    ApiOperation({
      summary: 'Fetch recent questions',
      description:
        'Lists recent questions ordered by creation date with pagination.',
    }),
    pageQuery(),
    ApiOkResponse({
      description: 'Recent questions returned successfully.',
      schema: {
        type: 'object',
        required: ['questions'],
        properties: {
          questions: { type: 'array', items: questionSchema },
        },
        example: {
          questions: [
            {
              id: '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec',
              title: 'How do domain events work?',
              slug: 'how-do-domain-events-work',
              bestAnswer: null,
              createdAt: '2026-06-16T01:41:44.215Z',
              updatedAt: null,
            },
          ],
        },
      },
    }),
    badRequestResponse('Invalid pagination query or application error.'),
    internalServerErrorResponse(),
  )
}

export function ApiGetQuestionBySlugDocs() {
  return applyDecorators(
    ApiTags('Questions'),
    protectedEndpoint(),
    ApiOperation({
      summary: 'Get question by slug',
      description:
        'Returns detailed question data, including author and attachments.',
    }),
    ApiParam({
      name: 'slug',
      description: 'Question slug.',
      schema: { type: 'string', example: 'how-do-domain-events-work' },
    }),
    ApiOkResponse({
      description: 'Question details returned successfully.',
      schema: {
        type: 'object',
        required: ['question'],
        properties: { question: questionDetailsSchema },
        example: {
          question: {
            questionId: '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec',
            authorId: 'b3b7f660-0cfb-4c79-ae2d-c6d20dd5fc4f',
            author: 'John Doe',
            title: 'How do domain events work?',
            content: 'I want to understand when domain events are dispatched.',
            slug: 'how-do-domain-events-work',
            bestAnswerId: null,
            attachments: [
              {
                id: 'c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f',
                title: 'architecture.pdf',
                url: 'f5f4a6f0-architecture.pdf',
              },
            ],
            createdAt: '2026-06-16T01:41:44.215Z',
            updatedAt: null,
          },
        },
      },
    }),
    badRequestResponse(
      'Question was not found or another application error occurred.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiEditQuestionDocs() {
  return applyDecorators(
    ApiTags('Questions'),
    protectedEndpoint(),
    uuidParam('id', 'Question ID.', '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec'),
    ApiOperation({
      summary: 'Edit question',
      description:
        'Updates title, content, and attachments of a question owned by the authenticated student.',
    }),
    ApiBody({
      description: 'Question update payload.',
      schema: questionRequestSchema,
      examples: {
        default: { summary: 'Edit question', value: questionRequestExample },
      },
    }),
    ApiNoContentResponse({ description: 'Question updated successfully.' }),
    badRequestResponse(
      'Invalid body, question not found, or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiDeleteQuestionDocs() {
  return applyDecorators(
    ApiTags('Questions'),
    protectedEndpoint(),
    uuidParam('id', 'Question ID.', '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec'),
    ApiOperation({
      summary: 'Delete question',
      description: 'Deletes a question owned by the authenticated student.',
    }),
    ApiNoContentResponse({ description: 'Question deleted successfully.' }),
    badRequestResponse(
      'Question not found or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiAnswerQuestionDocs() {
  return applyDecorators(
    ApiTags('Answers'),
    protectedEndpoint(),
    uuidParam(
      'questionId',
      'Question ID.',
      '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec',
    ),
    ApiOperation({
      summary: 'Answer question',
      description:
        'Creates an answer for a question as the authenticated student.',
    }),
    ApiBody({
      description: 'Answer creation payload.',
      schema: answerQuestionRequestSchema,
      examples: {
        default: { summary: 'Answer question', value: answerRequestExample },
      },
    }),
    ApiCreatedResponse({ description: 'Answer created successfully.' }),
    badRequestResponse(
      'Invalid body, question not found, or another application error occurred.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiFetchQuestionAnswersDocs() {
  return applyDecorators(
    ApiTags('Answers'),
    protectedEndpoint(),
    uuidParam(
      'questionId',
      'Question ID.',
      '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec',
    ),
    pageQuery(),
    ApiOperation({
      summary: 'Fetch question answers',
      description: 'Lists answers for a question with pagination.',
    }),
    ApiOkResponse({
      description: 'Question answers returned successfully.',
      schema: {
        type: 'object',
        required: ['answers'],
        properties: {
          answers: { type: 'array', items: answerSchema },
        },
      },
    }),
    badRequestResponse('Invalid pagination query or application error.'),
    internalServerErrorResponse(),
  )
}

export function ApiChooseQuestionBestAnswerDocs() {
  return applyDecorators(
    ApiTags('Answers'),
    protectedEndpoint(),
    uuidParam('answerId', 'Answer ID.', '72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
    ApiOperation({
      summary: 'Choose question best answer',
      description:
        'Marks an answer as the best answer for its question when requested by the question author.',
    }),
    ApiNoContentResponse({ description: 'Best answer selected successfully.' }),
    badRequestResponse(
      'Answer not found, question not found, or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiEditAnswerDocs() {
  return applyDecorators(
    ApiTags('Answers'),
    protectedEndpoint(),
    uuidParam('id', 'Answer ID.', '72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
    ApiOperation({
      summary: 'Edit answer',
      description:
        'Updates content and attachments of an answer owned by the authenticated student.',
    }),
    ApiBody({
      description: 'Answer update payload.',
      schema: editAnswerRequestSchema,
      examples: {
        default: {
          summary: 'Edit answer',
          value: { content: 'Updated answer content.', attachments: [] },
        },
      },
    }),
    ApiNoContentResponse({ description: 'Answer updated successfully.' }),
    badRequestResponse(
      'Invalid body, answer not found, or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiDeleteAnswerDocs() {
  return applyDecorators(
    ApiTags('Answers'),
    protectedEndpoint(),
    uuidParam('id', 'Answer ID.', '72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
    ApiOperation({
      summary: 'Delete answer',
      description: 'Deletes an answer owned by the authenticated student.',
    }),
    ApiNoContentResponse({ description: 'Answer deleted successfully.' }),
    badRequestResponse(
      'Answer not found or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiCommentOnQuestionDocs() {
  return applyDecorators(
    ApiTags('Comments'),
    protectedEndpoint(),
    uuidParam(
      'questionId',
      'Question ID.',
      '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec',
    ),
    ApiOperation({
      summary: 'Comment on question',
      description:
        'Creates a comment on a question as the authenticated student.',
    }),
    ApiBody({
      description: 'Comment creation payload.',
      schema: commentRequestSchema,
      examples: {
        default: {
          summary: 'Comment on question',
          value: commentRequestExample,
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Question comment created successfully.',
    }),
    badRequestResponse(
      'Invalid body, question not found, or another application error occurred.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiFetchQuestionCommentsDocs() {
  return applyDecorators(
    ApiTags('Comments'),
    protectedEndpoint(),
    uuidParam(
      'questionId',
      'Question ID.',
      '6f53d143-92e2-42c7-b24d-5ac7ddc4f3ec',
    ),
    pageQuery(),
    ApiOperation({
      summary: 'Fetch question comments',
      description:
        'Lists comments for a question with author information and pagination.',
    }),
    ApiOkResponse({
      description: 'Question comments returned successfully.',
      schema: {
        type: 'object',
        required: ['comments'],
        properties: {
          comments: { type: 'array', items: commentWithAuthorSchema },
        },
      },
    }),
    badRequestResponse('Invalid pagination query or application error.'),
    internalServerErrorResponse(),
  )
}

export function ApiDeleteQuestionCommentDocs() {
  return applyDecorators(
    ApiTags('Comments'),
    protectedEndpoint(),
    uuidParam(
      'id',
      'Question comment ID.',
      '9361e925-3759-4f20-81c5-b25cfcc1a230',
    ),
    ApiOperation({
      summary: 'Delete question comment',
      description:
        'Deletes a question comment owned by the authenticated student.',
    }),
    ApiNoContentResponse({
      description: 'Question comment deleted successfully.',
    }),
    badRequestResponse(
      'Comment not found or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiCommentOnAnswerDocs() {
  return applyDecorators(
    ApiTags('Comments'),
    protectedEndpoint(),
    uuidParam('answerId', 'Answer ID.', '72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
    ApiOperation({
      summary: 'Comment on answer',
      description:
        'Creates a comment on an answer as the authenticated student.',
    }),
    ApiBody({
      description: 'Comment creation payload.',
      schema: commentRequestSchema,
      examples: {
        default: { summary: 'Comment on answer', value: commentRequestExample },
      },
    }),
    ApiCreatedResponse({ description: 'Answer comment created successfully.' }),
    badRequestResponse(
      'Invalid body, answer not found, or another application error occurred.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiFetchAnswerCommentsDocs() {
  return applyDecorators(
    ApiTags('Comments'),
    protectedEndpoint(),
    uuidParam('answerId', 'Answer ID.', '72ecf947-10b9-4c14-a2ab-447ea74fdd88'),
    pageQuery(),
    ApiOperation({
      summary: 'Fetch answer comments',
      description:
        'Lists comments for an answer with author information and pagination.',
    }),
    ApiOkResponse({
      description: 'Answer comments returned successfully.',
      schema: {
        type: 'object',
        required: ['comments'],
        properties: {
          comments: { type: 'array', items: commentWithAuthorSchema },
        },
      },
    }),
    badRequestResponse('Invalid pagination query or application error.'),
    internalServerErrorResponse(),
  )
}

export function ApiDeleteAnswerCommentDocs() {
  return applyDecorators(
    ApiTags('Comments'),
    protectedEndpoint(),
    uuidParam(
      'id',
      'Answer comment ID.',
      '9361e925-3759-4f20-81c5-b25cfcc1a230',
    ),
    ApiOperation({
      summary: 'Delete answer comment',
      description:
        'Deletes an answer comment owned by the authenticated student.',
    }),
    ApiNoContentResponse({
      description: 'Answer comment deleted successfully.',
    }),
    badRequestResponse(
      'Comment not found or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiUploadAttachmentDocs() {
  return applyDecorators(
    ApiTags('Uploads'),
    protectedEndpoint(),
    ApiOperation({
      summary: 'Upload attachment',
      description:
        'Uploads a PNG, JPG, JPEG, or PDF attachment up to 2 MB and creates an attachment record.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Multipart file upload payload.',
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'PNG, JPG, JPEG, or PDF file up to 2 MB.',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Attachment uploaded successfully.',
      schema: {
        type: 'object',
        required: ['attachmentId'],
        properties: {
          attachmentId: uuid('c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f'),
        },
        example: {
          attachmentId: 'c7c3b6f3-a906-4f9f-a59a-9a68d9a73f4f',
        },
      },
    }),
    badRequestResponse(
      'Missing file, invalid file type, file too large, or application error.',
    ),
    internalServerErrorResponse(),
  )
}

export function ApiReadNotificationDocs() {
  return applyDecorators(
    ApiTags('Notifications'),
    protectedEndpoint(),
    uuidParam(
      'notificationId',
      'Notification ID.',
      '5151a6fa-0b06-4cc4-a763-0140df2f3fd7',
    ),
    ApiOperation({
      summary: 'Mark notification as read',
      description:
        'Marks a notification as read for the authenticated recipient.',
    }),
    ApiNoContentResponse({
      description: 'Notification marked as read successfully.',
    }),
    badRequestResponse(
      'Notification not found or authenticated user is not allowed.',
    ),
    internalServerErrorResponse(),
  )
}
