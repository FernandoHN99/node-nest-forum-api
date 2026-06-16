import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { Injectable } from '@nestjs/common'

import { EnvService } from '@/infra/env/env.service'

interface PackageJson {
  name: string
  version: string
  dependencies: Record<string, string>
}

interface HomeLink {
  label: string
  href: string
  description: string
  external?: boolean
}

interface HomeViewModel {
  apiName: string
  description: string
  version: string
  environment: string
  status: string
  technologies: string[]
  links: HomeLink[]
}

const TECHNOLOGY_LABELS: Record<string, string> = {
  '@nestjs/core': 'NestJS',
  '@nestjs/swagger': 'Swagger / OpenAPI',
  '@scalar/nestjs-api-reference': 'Scalar',
  '@prisma/client': 'Prisma',
  '@nestjs/jwt': 'JWT',
  '@nestjs/passport': 'Passport',
  ioredis: 'Redis',
  zod: 'Zod',
  '@aws-sdk/client-s3': 'Cloudflare R2 (S3)',
  bcryptjs: 'bcrypt',
}

@Injectable()
export class HomeService {
  constructor(private env: EnvService) {}

  private readPackageJson(): PackageJson {
    try {
      const packageJsonPath = join(process.cwd(), 'package.json')
      const raw = readFileSync(packageJsonPath, 'utf-8')

      return JSON.parse(raw) as PackageJson
    } catch {
      return { name: 'forum-api', version: '0.0.0', dependencies: {} }
    }
  }

  private buildViewModel(packageJson: PackageJson): HomeViewModel {
    const environment = process.env.NODE_ENV ?? 'development'

    const technologies = Object.keys(TECHNOLOGY_LABELS)
      .filter((dependency) => dependency in packageJson.dependencies)
      .map((dependency) => TECHNOLOGY_LABELS[dependency])

    const links: HomeLink[] = [
      {
        label: 'Documentation',
        href: '/docs',
        description: 'Interactive API reference powered by Scalar.',
      },
      {
        label: 'Swagger',
        href: '/swagger',
        description: 'Classic Swagger UI for the same OpenAPI spec.',
      },
      {
        label: 'Health Check',
        href: '/health',
        description: 'Liveness probe with uptime and timestamp.',
      },
    ]

    const githubUrl = this.env.get('GITHUB_REPOSITORY_URL')

    if (githubUrl) {
      links.push({
        label: 'GitHub Repository',
        href: githubUrl,
        description: 'Source code and project history on GitHub.',
        external: true,
      })
    }

    return {
      apiName: 'Forum Q&A API',
      description:
        'HTTP API for a questions and answers forum, built with clean architecture, domain-driven design and a fully documented OpenAPI specification.',
      version: packageJson.version,
      environment,
      status: 'Online',
      technologies,
      links,
    }
  }

  render(): string {
    const packageJson = this.readPackageJson()
    const model = this.buildViewModel(packageJson)

    return renderHomePage(model, packageJson.name)
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderHomePage(model: HomeViewModel, packageName: string): string {
  const environmentLabel =
    model.environment.charAt(0).toUpperCase() + model.environment.slice(1)

  const technologyChips = model.technologies
    .map((technology) => `<li class="chip">${escapeHtml(technology)}</li>`)
    .join('')

  const linkCards = model.links
    .map((link) => {
      const externalAttributes = link.external
        ? ' target="_blank" rel="noopener noreferrer"'
        : ''

      return `
        <a class="link-card" href="${escapeHtml(link.href)}"${externalAttributes}>
          <span class="link-card__label">${escapeHtml(link.label)}</span>
          <span class="link-card__description">${escapeHtml(
            link.description,
          )}</span>
          <span class="link-card__arrow" aria-hidden="true">&rarr;</span>
        </a>`
    })
    .join('')

  const metaCards = [
    { label: 'Status', value: model.status, accent: true },
    { label: 'Version', value: `v${model.version}` },
    { label: 'Environment', value: environmentLabel },
  ]
    .map(
      (meta) => `
        <div class="meta-card${meta.accent ? ' meta-card--accent' : ''}">
          <span class="meta-card__label">${escapeHtml(meta.label)}</span>
          <span class="meta-card__value">${
            meta.accent
              ? `<span class="status-dot" aria-hidden="true"></span>`
              : ''
          }${escapeHtml(meta.value)}</span>
        </div>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(model.description)}" />
    <title>${escapeHtml(model.apiName)}</title>
    <style>
      :root {
        --bg: #0b0d12;
        --bg-elevated: #12151d;
        --bg-card: #161a24;
        --border: rgba(255, 255, 255, 0.08);
        --text-primary: #f4f6fb;
        --text-secondary: #9aa3b2;
        --accent: #6366f1;
        --accent-soft: rgba(99, 102, 241, 0.16);
        --success: #34d399;
        --radius: 16px;
        --shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        min-height: 100vh;
        font-family: 'Inter', ui-sans-serif, system-ui, -apple-system,
          'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: var(--text-primary);
        background:
          radial-gradient(
            900px circle at 10% -10%,
            rgba(99, 102, 241, 0.18),
            transparent 45%
          ),
          radial-gradient(
            700px circle at 100% 0%,
            rgba(52, 211, 153, 0.1),
            transparent 40%
          ),
          var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
        -webkit-font-smoothing: antialiased;
      }

      .shell {
        width: 100%;
        max-width: 880px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: var(--bg-elevated);
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.18);
      }

      header.hero {
        margin-top: 24px;
      }

      h1 {
        font-size: clamp(32px, 6vw, 52px);
        line-height: 1.05;
        letter-spacing: -0.03em;
        font-weight: 700;
      }

      .hero p {
        margin-top: 18px;
        max-width: 620px;
        font-size: clamp(15px, 2.4vw, 18px);
        line-height: 1.6;
        color: var(--text-secondary);
      }

      .meta-grid {
        margin-top: 32px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .meta-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .meta-card--accent {
        background: linear-gradient(
          160deg,
          rgba(52, 211, 153, 0.12),
          var(--bg-card)
        );
      }

      .meta-card__label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-secondary);
      }

      .meta-card__value {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 20px;
        font-weight: 600;
      }

      section.panel {
        margin-top: 32px;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 28px;
        box-shadow: var(--shadow);
      }

      .panel__title {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-secondary);
        margin-bottom: 16px;
      }

      ul.chips {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .chip {
        padding: 8px 14px;
        border-radius: 999px;
        background: var(--accent-soft);
        border: 1px solid rgba(99, 102, 241, 0.28);
        color: #c7c9ff;
        font-size: 13px;
        font-weight: 500;
      }

      .links {
        margin-top: 24px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }

      .link-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 20px;
        border-radius: var(--radius);
        border: 1px solid var(--border);
        background: var(--bg-card);
        text-decoration: none;
        color: var(--text-primary);
        transition:
          transform 0.18s ease,
          border-color 0.18s ease,
          background 0.18s ease;
      }

      .link-card:hover {
        transform: translateY(-3px);
        border-color: rgba(99, 102, 241, 0.55);
        background: linear-gradient(
          160deg,
          var(--accent-soft),
          var(--bg-card)
        );
      }

      .link-card__label {
        font-size: 16px;
        font-weight: 600;
      }

      .link-card__description {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .link-card__arrow {
        position: absolute;
        top: 18px;
        right: 18px;
        color: var(--accent);
        font-size: 18px;
        opacity: 0.7;
      }

      footer {
        margin-top: 28px;
        text-align: center;
        font-size: 13px;
        color: var(--text-secondary);
      }

      footer code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        color: #c7c9ff;
      }

      @media (max-width: 640px) {
        .meta-grid,
        .links {
          grid-template-columns: 1fr;
        }

        section.panel {
          padding: 22px;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <span class="badge">
        <span class="status-dot" aria-hidden="true"></span>
        API ${escapeHtml(model.status)}
      </span>

      <header class="hero">
        <h1>${escapeHtml(model.apiName)}</h1>
        <p>${escapeHtml(model.description)}</p>
      </header>

      <div class="meta-grid">
        ${metaCards}
      </div>

      <section class="panel">
        <p class="panel__title">Technologies</p>
        <ul class="chips">
          ${technologyChips}
        </ul>

        <div class="links">
          ${linkCards}
        </div>
      </section>

      <footer>
        <code>${escapeHtml(packageName)}</code> &middot; v${escapeHtml(
          model.version,
        )} &middot; ${escapeHtml(environmentLabel)}
      </footer>
    </main>
  </body>
</html>`
}
